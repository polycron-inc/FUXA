  svgedit.math || (svgedit.math = {});
  var n = 1e-14,
      t = document.createElementNS(svgedit.NS.SVG, "svg");
  svgedit.math.transformPoint = function(n, t, i) {
      return {
          x: i.a * n + i.c * t + i.e,
          y: i.b * n + i.d * t + i.f
      }
  };
  svgedit.math.isIdentity = function(n) {
      return n.a === 1 && n.b === 0 && n.c === 0 && n.d === 1 && n.e === 0 && n.f === 0
  };
  svgedit.math.matrixMultiply = function() {
      for (var i = arguments, r = i.length, t = i[r - 1], u; r-- > 1;) u = i[r - 1], t = u.multiply(t);
      return Math.abs(t.a) < n && (t.a = 0), Math.abs(t.b) < n && (t.b = 0), Math.abs(t.c) < n && (t.c = 0), Math.abs(t.d) < n && (t.d = 0), Math.abs(t.e) < n && (t.e = 0), Math.abs(t.f) < n && (t.f = 0), t
  };
  svgedit.math.hasMatrixTransform = function(n) {
      var t, i;
      if (!n) return !1;
      for (t = n.numberOfItems; t--;)
          if (i = n.getItem(t), i.type == 1 && !svgedit.math.isIdentity(i.matrix)) return !0;
      return !1
  };
  svgedit.math.transformBox = function(n, t, i, r, u) {
      var h = svgedit.math.transformPoint,
          f = h(n, t, u),
          e = h(n + i, t, u),
          o = h(n, t + r, u),
          s = h(n + i, t + r, u),
          c = Math.min(f.x, e.x, o.x, s.x),
          a = Math.max(f.x, e.x, o.x, s.x),
          l = Math.min(f.y, e.y, o.y, s.y),
          v = Math.max(f.y, e.y, o.y, s.y);
      return {
          tl: f,
          tr: e,
          bl: o,
          br: s,
          aabox: {
              x: c,
              y: l,
              width: a - c,
              height: v - l
          }
      }
  };
  svgedit.math.transformListToTransform = function(n, i, r) {
      var e, f, u, o;
      if (n == null) return t.createSVGTransformFromMatrix(t.createSVGMatrix());
      for (i = i || 0, r = r || n.numberOfItems - 1, i = parseInt(i, 10), r = parseInt(r, 10), i > r && (e = r, r = i, i = e), f = t.createSVGMatrix(), u = i; u <= r; ++u) o = u >= 0 && u < n.numberOfItems ? n.getItem(u).matrix : t.createSVGMatrix(), f = svgedit.math.matrixMultiply(f, o);
      return t.createSVGTransformFromMatrix(f)
  };
  svgedit.math.getMatrix = function(n) {
      var t = svgedit.transformlist.getTransformList(n);
      return svgedit.math.transformListToTransform(t).matrix
  };
  svgedit.math.snapToAngle = function(n, t, i, r) {
      var o = Math.PI / 4,
          u = i - n,
          f = r - t,
          h = Math.atan2(f, u),
          s = Math.sqrt(u * u + f * f),
          e = Math.round(h / o) * o;
      return {
          x: n + s * Math.cos(e),
          y: t + s * Math.sin(e),
          a: e
      }
  };
  svgedit.math.rectsIntersect = function(n, t) {
      return t.x < n.x + n.width && t.x + t.width > n.x && t.y < n.y + n.height && t.y + t.height > n.y
  }
})();
var mysvgutils = function(t) {
  "use strict";
  return {
      initSvgutils: function() {
          function e(t) {
              if (svgedit.browser.supportsHVLineContainerBBox()) try {
                  return t.getBBox()
              } catch (t) {}
              var e, i, r = $.data(t, "ref"),
                  n = null;
              r ? (i = $(r).children().clone().attr("visibility", "hidden"), $(l).append(i), n = i.filter("line, path")) : n = $(t).find("line, path");
              var s = !1;
              if (n.length)
                  if (n.each(function() {
                          var t = this.getBBox();
                          t.width && t.height || (s = !0)
                      }), s) {
                      var o = r ? i : $(t).children();
                      e = getStrokedBBox(o)
                  } else e = t.getBBox();
              else e = t.getBBox();
              return r && i.remove(), e
          }
