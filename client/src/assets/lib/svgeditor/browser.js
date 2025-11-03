svgedit = {
  NS: {
      HTML: "http://www.w3.org/1999/xhtml",
      MATH: "http://www.w3.org/1998/Math/MathML",
      SE: "http://web-edit.com",
      SVG: "http://www.w3.org/2000/svg",
      XLINK: "http://www.w3.org/1999/xlink",
      XML: "http://www.w3.org/XML/1998/namespace",
      XMLNS: "http://www.w3.org/2000/xmlns/"
  }
}, svgedit.getReverseNS = function() {
  "use strict";
  var t = {};
  return $.each(this.NS, function(w, e) {
      t[e] = w.toLowerCase()
  }), t
};
var mybrowser = function() {
  "use strict";
  return {
      initBrowser: function() {
          svgedit.browser || (svgedit.browser = {});
          var e = svgedit.NS,
              t = !!document.createElementNS && !!document.createElementNS(e.SVG, "svg").createSVGRect;
          if (svgedit.browser.supportsSvg = function() {
                  return t
              }, svgedit.browser.supportsSvg()) {
              var r, n = navigator.userAgent,
                  o = document.createElementNS(e.SVG, "svg"),
                  s = !!window.opera,
                  i = n.indexOf("AppleWebKit") >= 0,
                  u = n.indexOf("Gecko/") >= 0,
                  c = n.indexOf("MSIE") >= 0,
                  d = n.indexOf("Chrome/") >= 0,
                  a = n.indexOf("Windows") >= 0,
                  m = n.indexOf("Macintosh") >= 0,
                  p = "ontouchstart" in window,
                  v = !!o.querySelector,
                  l = !!document.evaluate,
                  g = function() {
                      var t = document.createElementNS(e.SVG, "path");
                      t.setAttribute("d", "M0,0 10,10");
                      var r = t.pathSegList,
                          n = t.createSVGPathSegLinetoAbs(5, 5);
                      try {
                          return r.replaceItem(n, 1), !0
                      } catch (e) {}
                      return !1
                  }(),
                  S = function() {
                      var t = document.createElementNS(e.SVG, "path");
                      t.setAttribute("d", "M0,0 10,10");
                      var r = t.pathSegList,
                          n = t.createSVGPathSegLinetoAbs(5, 5);
                      try {
                          return r.insertItemBefore(n, 1), !0
                      } catch (e) {}
                      return !1
                  }(),
                  f = function() {
                      var t = document.createElementNS(e.SVG, "svg"),
                          r = document.createElementNS(e.SVG, "svg");
                      document.documentElement.appendChild(t), r.setAttribute("x", 5), t.appendChild(r);
                      var n = document.createElementNS(e.SVG, "text");
                      n.textContent = "a", r.appendChild(n);
                      var o = n.getStartPositionOfChar(0).x;
                      return document.documentElement.removeChild(t), 0 === o
                  }(),
                  b = function() {
                      var t = document.createElementNS(e.SVG, "svg");
                      document.documentElement.appendChild(t);
                      var r = document.createElementNS(e.SVG, "path");
                      r.setAttribute("d", "M0,0 C0,0 10,10 10,0"), t.appendChild(r);
                      var n = r.getBBox();
                      return document.documentElement.removeChild(t), n.height > 4 && n.height < 5
                  }(),
                  h = function() {
                      var t = document.createElementNS(e.SVG, "svg");
                      document.documentElement.appendChild(t);
                      var r = document.createElementNS(e.SVG, "path");
                      r.setAttribute("d", "M0,0 10,0");
                      var n = document.createElementNS(e.SVG, "path");
                      n.setAttribute("d", "M5,0 15,0");
                      var o = document.createElementNS(e.SVG, "g");
                      o.appendChild(r), o.appendChild(n), t.appendChild(o);
                      var s = o.getBBox();
                      return document.documentElement.removeChild(t), 15 == s.width
                  }(),
                  w = s,
                  E = function() {
                      var t = document.createElementNS(e.SVG, "rect");
                      t.setAttribute("x", .1);
                      var r = t.cloneNode(!1),
                          n = -1 == r.getAttribute("x").indexOf(",");
                      return n || $.alert("NOTE: This version of Opera is known to contain bugs."), n
                  }(),
                  G = (r = document.createElementNS(e.SVG, "rect"), r.setAttribute("style", "vector-effect:non-scaling-stroke"), "non-scaling-stroke" === r.style.vectorEffect),
                  N = function() {
                      var t = document.createElementNS(e.SVG, "rect"),
                          r = t.transform.baseVal,
                          n = o.createSVGTransform();
                      return r.appendItem(n), r.getItem(0) == n
                  }();
              svgedit.browser.isOpera = function() {
                  return s
              }, svgedit.browser.isWebkit = function() {
                  return i
              }, svgedit.browser.isGecko = function() {
                  return u
              }, svgedit.browser.isIE = function() {
                  return c
              }, svgedit.browser.isChrome = function() {
                  return d
              }, svgedit.browser.isWindows = function() {
                  return a
              }, svgedit.browser.isMac = function() {
                  return m
              }, svgedit.browser.isTouch = function() {
                  return p
              }, svgedit.browser.supportsSelectors = function() {
                  return v
              }, svgedit.browser.supportsXpath = function() {
                  return l
              }, svgedit.browser.supportsPathReplaceItem = function() {
                  return g
              }, svgedit.browser.supportsPathInsertItemBefore = function() {
                  return S
              }, svgedit.browser.supportsPathBBox = function() {
                  return b
              }, svgedit.browser.supportsHVLineContainerBBox = function() {
                  return h
              }, svgedit.browser.supportsGoodTextCharPos = function() {
                  return f
              }, svgedit.browser.supportsEditableText = function() {
                  return w
              }, svgedit.browser.supportsGoodDecimals = function() {
                  return E
              }, svgedit.browser.supportsNonScalingStroke = function() {
                  return G
              }, svgedit.browser.supportsNativeTransformLists = function() {
                  return N
              }
          } else window.location = "browser-not-supported.html"
      }
  }
}();
(function() {
  "use strict";

  function i(n) {
      var t = n.matrix,
          i = "",
          f, u, r;
      switch (n.type) {
          case 1:
              i = "matrix(" + [t.a, t.b, t.c, t.d, t.e, t.f].join(",") + ")";
              break;
          case 2:
              i = "translate(" + t.e + "," + t.f + ")";
              break;
          case 3:
              i = t.a == t.d ? "scale(" + t.a + ")" : "scale(" + t.a + "," + t.d + ")";
              break;
          case 4:
              f = 0;
              u = 0;
              n.angle != 0 && (r = 1 - t.a, u = (r * t.f + t.b * t.e) / (r * r + t.b * t.b), f = (t.e - t.b * u) / r);
              i = "rotate(" + n.angle + " " + f + "," + u + ")"
      }
      return i
  }
  var t, n;
