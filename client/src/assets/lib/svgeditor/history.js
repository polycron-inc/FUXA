  svgedit.history || (svgedit.history = {}), svgedit.history.HistoryEventTypes = {
      BEFORE_APPLY: "before_apply",
      AFTER_APPLY: "after_apply",
      BEFORE_UNAPPLY: "before_unapply",
      AFTER_UNAPPLY: "after_unapply"
  };
  svgedit.history.MoveElementCommand = function(t, e, i, n) {
      this.elem = t, this.text = n ? "Move " + t.tagName + " to " + n : "Move " + t.tagName, this.oldNextSibling = e, this.oldParent = i, this.newNextSibling = t.nextSibling, this.newParent = t.parentNode
  }, svgedit.history.MoveElementCommand.type = function() {
      return "svgedit.history.MoveElementCommand"
  }, svgedit.history.MoveElementCommand.prototype.type = svgedit.history.MoveElementCommand.type, svgedit.history.MoveElementCommand.prototype.getText = function() {
      return this.text
  }, svgedit.history.MoveElementCommand.prototype.apply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this), this.elem = this.newParent.insertBefore(this.elem, this.newNextSibling), t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this)
  }, svgedit.history.MoveElementCommand.prototype.unapply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this), this.elem = this.oldParent.insertBefore(this.elem, this.oldNextSibling), t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this)
  }, svgedit.history.MoveElementCommand.prototype.elements = function() {
      return [this.elem]
  }, svgedit.history.InsertElementCommand = function(t, e) {
      this.elem = t, this.text = e || "Create " + t.tagName, this.parent = t.parentNode, this.nextSibling = this.elem.nextSibling
  }, svgedit.history.InsertElementCommand.type = function() {
      return "svgedit.history.InsertElementCommand"
  }, svgedit.history.InsertElementCommand.prototype.type = svgedit.history.InsertElementCommand.type, svgedit.history.InsertElementCommand.prototype.getText = function() {
      return this.text
  }, svgedit.history.InsertElementCommand.prototype.apply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this), this.elem = this.parent.insertBefore(this.elem, this.nextSibling), t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this)
  }, svgedit.history.InsertElementCommand.prototype.unapply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this), this.parent = this.elem.parentNode, this.elem = this.elem.parentNode.removeChild(this.elem), t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this)
  }, svgedit.history.InsertElementCommand.prototype.elements = function() {
      return [this.elem]
  }, svgedit.history.RemoveElementCommand = function(t, e, i, n) {
      this.elem = t, this.text = n || "Delete " + t.tagName, this.nextSibling = e, this.parent = i, svgedit.transformlist.removeElementFromListMap(t)
  }, svgedit.history.RemoveElementCommand.type = function() {
      return "svgedit.history.RemoveElementCommand"
  }, svgedit.history.RemoveElementCommand.prototype.type = svgedit.history.RemoveElementCommand.type, svgedit.history.RemoveElementCommand.prototype.getText = function() {
      return this.text
  }, svgedit.history.RemoveElementCommand.prototype.apply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this), svgedit.transformlist.removeElementFromListMap(this.elem), this.parent = this.elem.parentNode, this.elem = this.parent.removeChild(this.elem), t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this)
  }, svgedit.history.RemoveElementCommand.prototype.unapply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this), svgedit.transformlist.removeElementFromListMap(this.elem), null == this.nextSibling && window.console && console.log("Error: reference element was lost"), this.parent.insertBefore(this.elem, this.nextSibling), t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this)
  }, svgedit.history.RemoveElementCommand.prototype.elements = function() {
      return [this.elem]
  }, svgedit.history.ChangeElementCommand = function(t, e, i) {
      this.elem = t, this.text = i ? "Change " + t.tagName + " " + i : "Change " + t.tagName, this.newValues = {}, this.oldValues = e;
      var n;
      for (n in e) "#text" == n ? this.newValues[n] = t.textContent : "#href" == n ? this.newValues[n] = svgedit.utilities.getHref(t) : this.newValues[n] = t.getAttribute(n)
  }, svgedit.history.ChangeElementCommand.type = function() {
      return "svgedit.history.ChangeElementCommand"
  }, svgedit.history.ChangeElementCommand.prototype.type = svgedit.history.ChangeElementCommand.type, svgedit.history.ChangeElementCommand.prototype.getText = function() {
      return this.text
  }, svgedit.history.ChangeElementCommand.prototype.apply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this);
      var e, i = !1;
      for (e in this.newValues) this.newValues[e] ? "#text" == e ? this.elem.textContent = this.newValues[e] : "#href" == e ? svgedit.utilities.setHref(this.elem, this.newValues[e]) : this.elem.setAttribute(e, this.newValues[e]) : "#text" == e ? this.elem.textContent = "" : (this.elem.setAttribute(e, ""), this.elem.removeAttribute(e)), "transform" == e && (i = !0);
      if (!i) {
          var n = svgedit.utilities.getRotationAngle(this.elem);
          if (n) {
              var s = elem.getBBox(),
                  o = s.x + s.width / 2,
                  r = s.y + s.height / 2,
                  h = ["rotate(", n, " ", o, ",", r, ")"].join("");
              h != elem.getAttribute("transform") && elem.setAttribute("transform", h)
          }
      }
      return t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this), !0
  }, svgedit.history.ChangeElementCommand.prototype.unapply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this);
      var e, i = !1;
      for (e in this.oldValues) this.oldValues[e] ? "#text" == e ? this.elem.textContent = this.oldValues[e] : "#href" == e ? svgedit.utilities.setHref(this.elem, this.oldValues[e]) : this.elem.setAttribute(e, this.oldValues[e]) : "#text" == e ? this.elem.textContent = "" : this.elem.removeAttribute(e), "transform" == e && (i = !0);
      if (!i) {
          var n = svgedit.utilities.getRotationAngle(this.elem);
          if (n) {
              var s = elem.getBBox(),
                  o = s.x + s.width / 2,
                  r = s.y + s.height / 2,
                  h = ["rotate(", n, " ", o, ",", r, ")"].join("");
              h != elem.getAttribute("transform") && elem.setAttribute("transform", h)
          }
      }
      return svgedit.transformlist.removeElementFromListMap(this.elem), t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this), !0
  }, svgedit.history.ChangeElementCommand.prototype.elements = function() {
      return [this.elem]
  }, svgedit.history.BatchCommand = function(t) {
      this.text = t || "Batch Command", this.stack = []
  }, svgedit.history.BatchCommand.type = function() {
      return "svgedit.history.BatchCommand"
  }, svgedit.history.BatchCommand.prototype.type = svgedit.history.BatchCommand.type, svgedit.history.BatchCommand.prototype.getText = function() {
      return this.text
  }, svgedit.history.BatchCommand.prototype.apply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_APPLY, this);
      var e, i = this.stack.length;
      for (e = 0; e < i; ++e) this.stack[e].apply(t);
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_APPLY, this)
  }, svgedit.history.BatchCommand.prototype.unapply = function(t) {
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.BEFORE_UNAPPLY, this);
      var e;
      for (e = this.stack.length - 1; e >= 0; e--) this.stack[e].unapply(t);
      t && t.handleHistoryEvent(svgedit.history.HistoryEventTypes.AFTER_UNAPPLY, this)
  }, svgedit.history.BatchCommand.prototype.elements = function() {
      for (var t = [], e = this.stack.length; e--;)
          for (var i = this.stack[e].elements(), n = i.length; n--;) t.indexOf(i[n]) == -1 && t.push(i[n]);
      return t
  }, svgedit.history.BatchCommand.prototype.addSubCommand = function(t) {
      this.stack.push(t)
  }, svgedit.history.BatchCommand.prototype.isEmpty = function() {
      return 0 === this.stack.length
  }, svgedit.history.UndoManager = function(t) {
      this.handler_ = t || null, this.undoStackPointer = 0, this.undoStack = [], this.undoChangeStackPointer = -1, this.undoableChangeStack = []
  }, svgedit.history.UndoManager.prototype.resetUndoStack = function() {
      this.undoStack = [], this.undoStackPointer = 0
  }, svgedit.history.UndoManager.prototype.getUndoStackSize = function() {
      return this.undoStackPointer
  }, svgedit.history.UndoManager.prototype.getRedoStackSize = function() {
      return this.undoStack.length - this.undoStackPointer
  }, svgedit.history.UndoManager.prototype.getNextUndoCommandText = function() {
      return this.undoStackPointer > 0 ? this.undoStack[this.undoStackPointer - 1].getText() : ""
  }, svgedit.history.UndoManager.prototype.getNextRedoCommandText = function() {
      return this.undoStackPointer < this.undoStack.length ? this.undoStack[this.undoStackPointer].getText() : ""
  }, svgedit.history.UndoManager.prototype.undo = function() {
      if (this.undoStackPointer > 0) {
          var t = this.undoStack[--this.undoStackPointer];
          t.unapply(this.handler_)
      }
  }, svgedit.history.UndoManager.prototype.redo = function() {
      if (this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0) {
          var t = this.undoStack[this.undoStackPointer++];
          t.apply(this.handler_)
      }
  }, svgedit.history.UndoManager.prototype.addCommandToHistory = function(t) {
      this.undoStackPointer < this.undoStack.length && this.undoStack.length > 0 && (this.undoStack = this.undoStack.splice(0, this.undoStackPointer)), this.undoStack.push(t), this.undoStackPointer = this.undoStack.length
  }, svgedit.history.UndoManager.prototype.beginUndoableChange = function(t, e) {
      for (var i = ++this.undoChangeStackPointer, n = e.length, s = new Array(n), o = new Array(n); n--;) {
          var r = e[n];
          null != r && (o[n] = r, s[n] = r.getAttribute(t))
      }
      this.undoableChangeStack[i] = {
          attrName: t,
          oldValues: s,
          elements: o
      }
  }, svgedit.history.UndoManager.prototype.finishUndoableChange = function() {
      for (var t = this.undoChangeStackPointer--, e = this.undoableChangeStack[t], i = e.elements.length, n = e.attrName, s = new svgedit.history.BatchCommand("Change " + n); i--;) {
          var o = e.elements[i];
          if (null != o) {
              var r = {};
              r[n] = e.oldValues[i], r[n] != o.getAttribute(n) && s.addSubCommand(new svgedit.history.ChangeElementCommand(o, r, n))
          }
      }
      return this.undoableChangeStack[t] = null, s
  }
})();
(function() {
  "use strict";
