// 케이스 스터디 공용: 히어로 셰이더 + 스크롤 리빌
(() => {
  const cv = document.querySelector('.hero canvas');
  if (cv && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const gl = cv.getContext('webgl'), hue = parseFloat(cv.dataset.hue || '0.2');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, `
precision highp float;uniform vec2 r;uniform float t,hu;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<6;k++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r.y;
vec2 q=vec2(fbm(uv*1.7+t*.04),fbm(uv*1.7+vec2(5.2,1.3)-t*.03));
float f=pow(fbm(uv*2.4+q*1.9+vec2(t*.018,-t*.013)),1.35);
vec3 hot=mix(vec3(.99,.32,.03),vec3(.55,.12,.85),hu);
vec3 c=mix(hot,vec3(.93,.06,.47),smoothstep(.22,.58,f));
c=mix(c,vec3(.42,.08,.72),smoothstep(.55,.88,f));
c=mix(c,vec3(.07,.01,.11),smoothstep(.78,1.12,f));
c*=.9; c+=(h(gl_FragCoord.xy+t)-.5)*.05;
gl_FragColor=vec4(c,1.);}`));
    gl.linkProgram(p); gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(p, n);
    gl.uniform1f(U('hu'), hue);
    const rs = () => { const d = Math.min(devicePixelRatio, 1.5);
      cv.width = cv.clientWidth * d; cv.height = cv.clientHeight * d;
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('r'), cv.width, cv.height); };
    addEventListener('resize', rs); rs();
    (function loop(now){ gl.uniform1f(U('t'), now/1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3); requestAnimationFrame(loop); })(0);
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('main > *').forEach(el => { el.classList.add('rv'); io.observe(el); });
})();
