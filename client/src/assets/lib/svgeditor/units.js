  svgedit.units || (svgedit.units = {});
  var i = svgedit.NS,
      r = ["x", "x1", "cx", "rx", "width"],
      u = ["y", "y1", "cy", "ry", "height"],
      e = ["r", "radius"].concat(r, u),
      n, t = {};
  svgedit.units.init = function(r) {
      var e, u, o, f;
      n = r;
      e = document.createElementNS(i.SVG, "svg");
      document.body.appendChild(e);
      u = document.createElementNS(i.SVG, "rect");
      u.setAttribute("width", "1em");
      u.setAttribute("height", "1ex");
      u.setAttribute("x", "1in");
      e.appendChild(u);
      o = u.getBBox();
      document.body.removeChild(e);
      f = o.x;
      t = {
          em: o.width,
          ex: o.height,
          "in": f,
          cm: f / 2.54,
          mm: f / 25.4,
          pt: f / 72,
          pc: f / 6,
          px: 1,
          "%": 0
      }
  };
  svgedit.units.getTypeMap = function() {
      return t
  };
  svgedit.units.shortFloat = function(t) {
      var i = n.getRoundDigits();
      return isNaN(t) ? $.isArray(t) ? svgedit.units.shortFloat(t[0]) + "," + svgedit.units.shortFloat(t[1]) : parseFloat(t).toFixed(i) - 0 : +(+t).toFixed(i)
  };
  svgedit.units.convertUnit = function(i, r) {
      return r = r || n.getBaseUnit(), svgedit.units.shortFloat(i / t[r])
  };
  svgedit.units.setUnitAttr = function(n, t, i) {
      n.setAttribute(t, i)
  };
  f = {
      line: ["x1", "x2", "y1", "y2"],
      circle: ["cx", "cy", "r"],
      ellipse: ["cx", "cy", "rx", "ry"],
      foreignObject: ["x", "y", "width", "height"],
      rect: ["x", "y", "width", "height"],
      image: ["x", "y", "width", "height"],
      use: ["x", "y", "width", "height"],
      text: ["x", "y"]
  };
  svgedit.units.convertAttrs = function(i) {
      var c = i.tagName,
          s = n.getBaseUnit(),
          e = f[c],
          h, r, o, u;
      if (e)
          for (h = e.length, r = 0; r < h; r++) o = e[r], u = i.getAttribute(o), u && (isNaN(u) || i.setAttribute(o, u / t[s] + s))
  };
  svgedit.units.convertToNum = function(i, f) {
      var e, o, s, h;
      return isNaN(f) ? f.substr(-1) === "%" ? (e = f.substr(0, f.length - 1) / 100, o = n.getWidth(), s = n.getHeight(), r.indexOf(i) >= 0) ? e * o : u.indexOf(i) >= 0 ? e * s : e * Math.sqrt(o * o + s * s) / Math.sqrt(2) : (h = f.substr(-2), e = f.substr(0, f.length - 2), e * t[h]) : +f
  };
  svgedit.units.isValidUnit = function(i, r, u) {
      var f = !1,
          o, s;
      if (e.indexOf(i) >= 0) isNaN(r) ? (r = r.toLowerCase(), $.each(t, function(n) {
          if (!f) {
              var t = new RegExp("^-?[\\d\\.]+" + n + "$");
              t.test(r) && (f = !0)
          }
      })) : f = !0;
      else if (i == "id") {
          o = !1;
          try {
              s = n.getElement(r);
              o = s == null || s === u
          } catch (h) {}
          return o
      }
      return f = !0
  }
})();
(function() {
  "use strict";
