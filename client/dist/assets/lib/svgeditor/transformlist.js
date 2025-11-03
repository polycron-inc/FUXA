  svgedit.transformlist || (svgedit.transformlist = {});
  t = document.createElementNS(svgedit.NS.SVG, "svg");
  n = {};
  svgedit.transformlist.SVGTransformList = function(r) {
      this._elem = r || null;
      this._xforms = [];
      this._update = function() {
          for (var r = "", f = t.createSVGMatrix(), u, n = 0; n < this.numberOfItems; ++n) u = this._list.getItem(n), r += i(u) + " ";
          this._elem.setAttribute("transform", r)
      };
      this._list = this;
      this._init = function() {
          var u = this._elem.getAttribute("transform"),
              e, r;
          if (u)
              for (e = /\s*((scale|matrix|rotate|translate)\s*\(.*?\))\s*,?\s*/, r = !0; r;)
                  if (r = u.match(e), u = u.replace(e, ""), r && r[1]) {
                      var l = r[1],
                          h = l.split(/\s*\(/),
                          i = h[0],
                          o = h[1].match(/\s*(.*?)\s*\)/);
                      o[1] = o[1].replace(/(\d)-/g, "$1 -");
                      var f = o[1].split(/[, ]+/),
                          a = "abcdef".split(""),
                          c = t.createSVGMatrix();
                      $.each(f, function(n, t) {
                          f[n] = parseFloat(t);
                          i == "matrix" && (c[a[n]] = f[n])
                      });
                      var s = t.createSVGTransform(),
                          v = "set" + i.charAt(0).toUpperCase() + i.slice(1),
                          n = i == "matrix" ? [c] : f;
                      i == "scale" && n.length == 1 ? n.push(n[0]) : i == "translate" && n.length == 1 ? n.push(0) : i == "rotate" && n.length == 1 && n.push(0, 0);
                      s[v].apply(s, n);
                      this._list.appendItem(s)
                  }
      };
      this._removeFromOtherLists = function(t) {
          var u, f, r, i, e;
          if (t) {
              u = !1;
              for (f in n) {
                  for (r = n[f], i = 0, e = r._xforms.length; i < e; ++i)
                      if (r._xforms[i] == t) {
                          u = !0;
                          r.removeItem(i);
                          break
                      } if (u) break
              }
          }
      };
      this.numberOfItems = 0;
      this.clear = function() {
          this.numberOfItems = 0;
          this._xforms = []
      };
      this.initialize = function(n) {
          this.numberOfItems = 1;
          this._removeFromOtherLists(n);
          this._xforms = [n]
      };
      this.getItem = function(n) {
          if (n < this.numberOfItems && n >= 0) return this._xforms[n];
          throw {
              code: 1
          };
      };
      this.insertItemBefore = function(n, t) {
          var u = null,
              r, i, f;
          if (t >= 0)
              if (t < this.numberOfItems) {
                  for (this._removeFromOtherLists(n), r = new Array(this.numberOfItems + 1), i = 0; i < t; ++i) r[i] = this._xforms[i];
                  for (r[i] = n, f = i + 1; i < this.numberOfItems; ++f, ++i) r[f] = this._xforms[i];
                  this.numberOfItems++;
                  this._xforms = r;
                  u = n;
                  this._list._update()
              } else u = this._list.appendItem(n);
          return u
      };
      this.replaceItem = function(n, t) {
          var i = null;
          return t < this.numberOfItems && t >= 0 && (this._removeFromOtherLists(n), this._xforms[t] = n, i = n, this._list._update()), i
      };
      this.removeItem = function(n) {
          if (n < this.numberOfItems && n >= 0) {
              for (var u = this._xforms[n], r = new Array(this.numberOfItems - 1), i, t = 0; t < n; ++t) r[t] = this._xforms[t];
              for (i = t; i < this.numberOfItems - 1; ++i, ++t) r[i] = this._xforms[t + 1];
              return this.numberOfItems--, this._xforms = r, this._list._update(), u
          }
          throw {
              code: 1
          };
      };
      this.appendItem = function(n) {
          return this._removeFromOtherLists(n), this._xforms.push(n), this.numberOfItems++, this._list._update(), n
      }
  };
  svgedit.transformlist.resetListMap = function() {
      n = {}
  };
  svgedit.transformlist.removeElementFromListMap = function(t) {
      t.id && n[t.id] && delete n[t.id]
  };
  svgedit.transformlist.getTransformList = function(t) {
      if (!svgedit.browser.supportsNativeTransformLists()) {
          var i = t.id || "temp",
              r = n[i];
          return r && i !== "temp" || (n[i] = new svgedit.transformlist.SVGTransformList(t), n[i]._init(), r = n[i]), r
      }
      return t.transform ? t.transform.baseVal : t.gradientTransform ? t.gradientTransform.baseVal : t.patternTransform ? t.patternTransform.baseVal : null
  }
})();
(function() {
  "use strict";
  var f;
