/**
 * DataForwarder: 將 FUXA 設備數據轉發到 FMS Rust 後端，觸發告警規則檢查
 *
 * 當設備值變化時，自動將數據 POST 到 Rust 後端的 /schideron/openApi/alarm/check 端點
 * 環境變數:
 *   FMS_BACKEND_URL  - Rust 後端 URL (例如: http://localhost:8080)
 *   FMS_FORWARD_ENABLED - 是否啟用轉發 (預設: true)
 *   FMS_FORWARD_INTERVAL_MS - 批次轉發間隔毫秒 (預設: 3000)
 */

'use strict';

const axios = require('axios');

function DataForwarder(_runtime) {
    var runtime = _runtime;
    var logger = runtime.logger;
    var events = runtime.events;

    // 配置
    var backendUrl = process.env.FMS_BACKEND_URL || 'http://localhost:8080';
    var enabled = process.env.FMS_FORWARD_ENABLED !== 'false'; // 預設啟用
    var forwardIntervalMs = parseInt(process.env.FMS_FORWARD_INTERVAL_MS) || 3000; // 預設3秒

    // 緩衝區：收集設備值變化，批次發送
    var valueBuffer = new Map(); // key: "deviceName:tagId", value: { metric_name, value, value_text }
    var forwardTimer = null;

    /**
     * 啟動數據轉發器
     */
    this.start = function () {
        if (!enabled) {
            logger.info('dataforwarder: 數據轉發已停用 (FMS_FORWARD_ENABLED=false)', true);
            return;
        }

        logger.info('dataforwarder: 啟動，後端地址=' + backendUrl + '，間隔=' + forwardIntervalMs + 'ms', true);

        // 監聽設備值變化事件
        events.on('device-value:changed', _onDeviceValueChanged);

        // 定時批次轉發
        forwardTimer = setInterval(function () {
            _flushBuffer();
        }, forwardIntervalMs);
    };

    /**
     * 停止數據轉發器
     */
    this.stop = function () {
        if (forwardTimer) {
            clearInterval(forwardTimer);
            forwardTimer = null;
        }
        events.removeListener('device-value:changed', _onDeviceValueChanged);
        valueBuffer.clear();
        logger.info('dataforwarder: 已停止', true);
    };

    /**
     * 處理設備值變化事件
     * event 格式: { id: deviceName, values: { tagId: { id, name, value, type, ... }, ... } }
     */
    var _onDeviceValueChanged = function (event) {
        try {
            if (!event || !event.values) return;

            var deviceName = event.id || 'unknown';
            var values = event.values;

            for (var tagId in values) {
                var tag = values[tagId];
                if (tag && tag.value !== undefined && tag.value !== null) {
                    // 使用 tag name 或 address 作為 metric_name
                    var metricName = tag.name || tag.address || tagId;
                    var numValue = null;
                    var textValue = null;

                    // 判斷值類型
                    if (typeof tag.value === 'number') {
                        numValue = tag.value;
                    } else if (typeof tag.value === 'string') {
                        var parsed = parseFloat(tag.value);
                        if (!isNaN(parsed)) {
                            numValue = parsed;
                        }
                        textValue = tag.value;
                    } else if (typeof tag.value === 'boolean') {
                        numValue = tag.value ? 1 : 0;
                        textValue = tag.value.toString();
                    }

                    var bufferKey = deviceName + ':' + metricName;
                    valueBuffer.set(bufferKey, {
                        device_name: deviceName,
                        metric_name: metricName,
                        value: numValue,
                        value_text: textValue
                    });
                }
            }
        } catch (err) {
            // 靜默處理錯誤，避免影響 FUXA 主流程
        }
    };

    /**
     * 批次發送緩衝區中的數據到 Rust 後端
     */
    var _flushBuffer = function () {
        if (valueBuffer.size === 0) return;

        // 複製並清空緩衝區
        var items = Array.from(valueBuffer.values());
        valueBuffer.clear();

        // 依序發送每個值的告警檢查
        items.forEach(function (item) {
            var checkData = {
                device_id: null,  // 不傳 device_id，匹配通用告警規則
                metric_name: item.metric_name,
                value: item.value,
                value_text: item.value_text
            };

            var url = backendUrl + '/schideron/openApi/alarm/check';

            axios.post(url, checkData, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' }
            }).then(function (res) {
                // 檢查是否有觸發的告警
                var data = res.data && res.data.data;
                if (data && data.triggered && data.triggered > 0) {
                    logger.info(
                        'dataforwarder: 設備 ' + item.device_name +
                        ' 指標 ' + item.metric_name +
                        ' 觸發了 ' + data.triggered + ' 個告警',
                        true
                    );
                }
            }).catch(function (err) {
                // 靜默處理錯誤，僅在 debug 模式記錄
                if (process.env.FMS_FORWARD_DEBUG === 'true') {
                    logger.warn('dataforwarder: 轉發失敗 ' + item.metric_name + ': ' + (err.message || err));
                }
            });
        });
    };
}

module.exports = {
    create: function (runtime) {
        return new DataForwarder(runtime);
    }
};
