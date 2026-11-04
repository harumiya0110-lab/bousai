import{n as e}from"./three-vendor-BIBS8pgm.js";import{Ar as t,Dr as n,E as r,Ii as i,Lt as a,Qn as o,Wr as s,an as c,ar as l,fa as u,io as d,ir as f,jn as p,ka as m,kr as ee,ma as h,mo as g,no as _,on as v,pn as y,qa as b,ro as x,ta as S,tr as C}from"./three-vendor-BF58tRDi.js";var w=e=>typeof e==`object`&&typeof e.then==`function`,T=[];function E(e,t,n=(e,t)=>e===t){if(e===t)return!0;if(!e||!t)return!1;let r=e.length;if(t.length!==r)return!1;for(let i=0;i<r;i++)if(!n(e[i],t[i]))return!1;return!0}function D(e,t=null,n=!1,r={}){t===null&&(t=[e]);for(let e of T)if(E(t,e.keys,e.equal)){if(n)return;if(Object.prototype.hasOwnProperty.call(e,`error`))throw e.error;if(Object.prototype.hasOwnProperty.call(e,`response`))return r.lifespan&&r.lifespan>0&&(e.timeout&&clearTimeout(e.timeout),e.timeout=setTimeout(e.remove,r.lifespan)),e.response;if(!n)throw e.promise}let i={keys:t,equal:r.equal,remove:()=>{let e=T.indexOf(i);e!==-1&&T.splice(e,1)},promise:(w(e)?e:e(...t)).then(e=>{i.response=e,r.lifespan&&r.lifespan>0&&(i.timeout=setTimeout(i.remove,r.lifespan))}).catch(e=>i.error=e)};if(T.push(i),!n)throw i.promise}var O=(e,t,n)=>D(e,t,!1,n),te=(e,t,n)=>void D(e,t,!0,n),k=e=>{if(e===void 0||e.length===0)T.splice(0,T.length);else{let t=T.find(t=>E(e,t.keys,t.equal));t&&t.remove()}},A=parseInt(`187`.replace(/\D+/g,``)),j=A>=125?`uv1`:`uv2`,M=Object.defineProperty,ne=(e,t,n)=>t in e?M(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,N=(e,t,n)=>(ne(e,typeof t==`symbol`?t:t+``,n),n),re=class{constructor(){N(this,`_listeners`)}addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let n=this._listeners[e];if(n!==void 0){let e=n.indexOf(t);e!==-1&&n.splice(e,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let t=this._listeners[e.type];if(t!==void 0){e.target=this;let n=t.slice(0);for(let t=0,r=n.length;t<r;t++)n[t].call(this,e);e.target=null}}},ie=Object.defineProperty,ae=(e,t,n)=>t in e?ie(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,P=(e,t,n)=>(ae(e,typeof t==`symbol`?t:t+``,n),n),F=new i,oe=new t,se=Math.cos(Math.PI/180*70),ce=(e,t)=>(e%t+t)%t,le=class extends re{constructor(e,t){super(),P(this,`object`),P(this,`domElement`),P(this,`enabled`,!0),P(this,`target`,new x),P(this,`minDistance`,0),P(this,`maxDistance`,1/0),P(this,`minZoom`,0),P(this,`maxZoom`,1/0),P(this,`minPolarAngle`,0),P(this,`maxPolarAngle`,Math.PI),P(this,`minAzimuthAngle`,-1/0),P(this,`maxAzimuthAngle`,1/0),P(this,`enableDamping`,!1),P(this,`dampingFactor`,.05),P(this,`enableZoom`,!0),P(this,`zoomSpeed`,1),P(this,`enableRotate`,!0),P(this,`rotateSpeed`,1),P(this,`enablePan`,!0),P(this,`panSpeed`,1),P(this,`screenSpacePanning`,!0),P(this,`keyPanSpeed`,7),P(this,`zoomToCursor`,!1),P(this,`autoRotate`,!1),P(this,`autoRotateSpeed`,2),P(this,`reverseOrbit`,!1),P(this,`reverseHorizontalOrbit`,!1),P(this,`reverseVerticalOrbit`,!1),P(this,`keys`,{LEFT:`ArrowLeft`,UP:`ArrowUp`,RIGHT:`ArrowRight`,BOTTOM:`ArrowDown`}),P(this,`mouseButtons`,{LEFT:o.ROTATE,MIDDLE:o.DOLLY,RIGHT:o.PAN}),P(this,`touches`,{ONE:m.ROTATE,TWO:m.DOLLY_PAN}),P(this,`target0`),P(this,`position0`),P(this,`zoom0`),P(this,`_domElementKeyEvents`,null),P(this,`getPolarAngle`),P(this,`getAzimuthalAngle`),P(this,`setPolarAngle`),P(this,`setAzimuthalAngle`),P(this,`getDistance`),P(this,`getZoomScale`),P(this,`listenToKeyEvents`),P(this,`stopListenToKeyEvents`),P(this,`saveState`),P(this,`reset`),P(this,`update`),P(this,`connect`),P(this,`dispose`),P(this,`dollyIn`),P(this,`dollyOut`),P(this,`getScale`),P(this,`setScale`),this.object=e,this.domElement=t,this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this.getPolarAngle=()=>f.phi,this.getAzimuthalAngle=()=>f.theta,this.setPolarAngle=e=>{let t=ce(e,2*Math.PI),n=f.phi;n<0&&(n+=2*Math.PI),t<0&&(t+=2*Math.PI);let i=Math.abs(t-n);2*Math.PI-i<i&&(t<n?t+=2*Math.PI:n+=2*Math.PI),p.phi=t-n,r.update()},this.setAzimuthalAngle=e=>{let t=ce(e,2*Math.PI),n=f.theta;n<0&&(n+=2*Math.PI),t<0&&(t+=2*Math.PI);let i=Math.abs(t-n);2*Math.PI-i<i&&(t<n?t+=2*Math.PI:n+=2*Math.PI),p.theta=t-n,r.update()},this.getDistance=()=>r.object.position.distanceTo(r.target),this.listenToKeyEvents=e=>{e.addEventListener(`keydown`,Se),this._domElementKeyEvents=e},this.stopListenToKeyEvents=()=>{this._domElementKeyEvents.removeEventListener(`keydown`,Se),this._domElementKeyEvents=null},this.saveState=()=>{r.target0.copy(r.target),r.position0.copy(r.object.position),r.zoom0=r.object.zoom},this.reset=()=>{r.target.copy(r.target0),r.object.position.copy(r.position0),r.object.zoom=r.zoom0,r.object.updateProjectionMatrix(),r.dispatchEvent(i),r.update(),u=l.NONE},this.update=(()=>{let t=new x,a=new x(0,1,0),o=new s().setFromUnitVectors(e.up,a),c=o.clone().invert(),m=new x,h=new s,_=2*Math.PI;return function(){let s=r.object.position;o.setFromUnitVectors(e.up,a),c.copy(o).invert(),t.copy(s).sub(r.target),t.applyQuaternion(o),f.setFromVector3(t),r.autoRotate&&u===l.NONE&&re(ne()),r.enableDamping?(f.theta+=p.theta*r.dampingFactor,f.phi+=p.phi*r.dampingFactor):(f.theta+=p.theta,f.phi+=p.phi);let y=r.minAzimuthAngle,b=r.maxAzimuthAngle;isFinite(y)&&isFinite(b)&&(y<-Math.PI?y+=_:y>Math.PI&&(y-=_),b<-Math.PI?b+=_:b>Math.PI&&(b-=_),y<=b?f.theta=Math.max(y,Math.min(b,f.theta)):f.theta=f.theta>(y+b)/2?Math.max(y,f.theta):Math.min(b,f.theta)),f.phi=Math.max(r.minPolarAngle,Math.min(r.maxPolarAngle,f.phi)),f.makeSafe(),r.enableDamping===!0?r.target.addScaledVector(v,r.dampingFactor):r.target.add(v),r.zoomToCursor&&A||r.object.isOrthographicCamera?f.radius=V(f.radius):f.radius=V(f.radius*g),t.setFromSpherical(f),t.applyQuaternion(c),s.copy(r.target).add(t),r.object.matrixAutoUpdate||r.object.updateMatrix(),r.object.lookAt(r.target),r.enableDamping===!0?(p.theta*=1-r.dampingFactor,p.phi*=1-r.dampingFactor,v.multiplyScalar(1-r.dampingFactor)):(p.set(0,0,0),v.set(0,0,0));let S=!1;if(r.zoomToCursor&&A){let n=null;if(r.object instanceof ee&&r.object.isPerspectiveCamera){let e=t.length();n=V(e*g);let i=e-n;r.object.position.addScaledVector(te,i),r.object.updateMatrixWorld()}else if(r.object.isOrthographicCamera){let e=new x(k.x,k.y,0);e.unproject(r.object),r.object.zoom=Math.max(r.minZoom,Math.min(r.maxZoom,r.object.zoom/g)),r.object.updateProjectionMatrix(),S=!0;let i=new x(k.x,k.y,0);i.unproject(r.object),r.object.position.sub(i).add(e),r.object.updateMatrixWorld(),n=t.length()}else console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.`),r.zoomToCursor=!1;n!==null&&(r.screenSpacePanning?r.target.set(0,0,-1).transformDirection(r.object.matrix).multiplyScalar(n).add(r.object.position):(F.origin.copy(r.object.position),F.direction.set(0,0,-1).transformDirection(r.object.matrix),Math.abs(r.object.up.dot(F.direction))<se?e.lookAt(r.target):(oe.setFromNormalAndCoplanarPoint(r.object.up,r.target),F.intersectPlane(oe,r.target))))}else r.object instanceof n&&r.object.isOrthographicCamera&&(S=g!==1,S&&(r.object.zoom=Math.max(r.minZoom,Math.min(r.maxZoom,r.object.zoom/g)),r.object.updateProjectionMatrix()));return g=1,A=!1,S||m.distanceToSquared(r.object.position)>d||8*(1-h.dot(r.object.quaternion))>d?(r.dispatchEvent(i),m.copy(r.object.position),h.copy(r.object.quaternion),S=!1,!0):!1}})(),this.connect=e=>{r.domElement=e,r.domElement.style.touchAction=`none`,r.domElement.addEventListener(`contextmenu`,Te),r.domElement.addEventListener(`pointerdown`,_e),r.domElement.addEventListener(`pointercancel`,$),r.domElement.addEventListener(`wheel`,xe)},this.dispose=()=>{var e,t,n,i,a,o;r.domElement&&(r.domElement.style.touchAction=`auto`),(e=r.domElement)==null||e.removeEventListener(`contextmenu`,Te),(t=r.domElement)==null||t.removeEventListener(`pointerdown`,_e),(n=r.domElement)==null||n.removeEventListener(`pointercancel`,$),(i=r.domElement)==null||i.removeEventListener(`wheel`,xe),(a=r.domElement)==null||a.ownerDocument.removeEventListener(`pointermove`,ve),(o=r.domElement)==null||o.ownerDocument.removeEventListener(`pointerup`,$),r._domElementKeyEvents!==null&&r._domElementKeyEvents.removeEventListener(`keydown`,Se)};let r=this,i={type:`change`},a={type:`start`},c={type:`end`},l={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},u=l.NONE,d=1e-6,f=new h,p=new h,g=1,v=new x,y=new _,b=new _,S=new _,C=new _,w=new _,T=new _,E=new _,D=new _,O=new _,te=new x,k=new _,A=!1,j=[],M={};function ne(){return 2*Math.PI/60/60*r.autoRotateSpeed}function N(){return .95**r.zoomSpeed}function re(e){r.reverseOrbit||r.reverseHorizontalOrbit?p.theta+=e:p.theta-=e}function ie(e){r.reverseOrbit||r.reverseVerticalOrbit?p.phi+=e:p.phi-=e}let ae=(()=>{let e=new x;return function(t,n){e.setFromMatrixColumn(n,0),e.multiplyScalar(-t),v.add(e)}})(),le=(()=>{let e=new x;return function(t,n){r.screenSpacePanning===!0?e.setFromMatrixColumn(n,1):(e.setFromMatrixColumn(n,0),e.crossVectors(r.object.up,e)),e.multiplyScalar(t),v.add(e)}})(),I=(()=>{let e=new x;return function(t,i){let a=r.domElement;if(a&&r.object instanceof ee&&r.object.isPerspectiveCamera){let n=r.object.position;e.copy(n).sub(r.target);let o=e.length();o*=Math.tan(r.object.fov/2*Math.PI/180),ae(2*t*o/a.clientHeight,r.object.matrix),le(2*i*o/a.clientHeight,r.object.matrix)}else a&&r.object instanceof n&&r.object.isOrthographicCamera?(ae(t*(r.object.right-r.object.left)/r.object.zoom/a.clientWidth,r.object.matrix),le(i*(r.object.top-r.object.bottom)/r.object.zoom/a.clientHeight,r.object.matrix)):(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.`),r.enablePan=!1)}})();function L(e){r.object instanceof ee&&r.object.isPerspectiveCamera||r.object instanceof n&&r.object.isOrthographicCamera?g=e:(console.warn(`WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.`),r.enableZoom=!1)}function R(e){L(g/e)}function z(e){L(g*e)}function B(e){if(!r.zoomToCursor||!r.domElement)return;A=!0;let t=r.domElement.getBoundingClientRect(),n=e.clientX-t.left,i=e.clientY-t.top,a=t.width,o=t.height;k.x=n/a*2-1,k.y=-(i/o)*2+1,te.set(k.x,k.y,1).unproject(r.object).sub(r.object.position).normalize()}function V(e){return Math.max(r.minDistance,Math.min(r.maxDistance,e))}function H(e){y.set(e.clientX,e.clientY)}function ue(e){B(e),E.set(e.clientX,e.clientY)}function U(e){C.set(e.clientX,e.clientY)}function W(e){b.set(e.clientX,e.clientY),S.subVectors(b,y).multiplyScalar(r.rotateSpeed);let t=r.domElement;t&&(re(2*Math.PI*S.x/t.clientHeight),ie(2*Math.PI*S.y/t.clientHeight)),y.copy(b),r.update()}function G(e){D.set(e.clientX,e.clientY),O.subVectors(D,E),O.y>0?R(N()):O.y<0&&z(N()),E.copy(D),r.update()}function K(e){w.set(e.clientX,e.clientY),T.subVectors(w,C).multiplyScalar(r.panSpeed),I(T.x,T.y),C.copy(w),r.update()}function de(e){B(e),e.deltaY<0?z(N()):e.deltaY>0&&R(N()),r.update()}function q(e){let t=!1;switch(e.code){case r.keys.UP:I(0,r.keyPanSpeed),t=!0;break;case r.keys.BOTTOM:I(0,-r.keyPanSpeed),t=!0;break;case r.keys.LEFT:I(r.keyPanSpeed,0),t=!0;break;case r.keys.RIGHT:I(-r.keyPanSpeed,0),t=!0}t&&(e.preventDefault(),r.update())}function fe(){if(j.length==1)y.set(j[0].pageX,j[0].pageY);else{let e=.5*(j[0].pageX+j[1].pageX),t=.5*(j[0].pageY+j[1].pageY);y.set(e,t)}}function J(){if(j.length==1)C.set(j[0].pageX,j[0].pageY);else{let e=.5*(j[0].pageX+j[1].pageX),t=.5*(j[0].pageY+j[1].pageY);C.set(e,t)}}function Y(){let e=j[0].pageX-j[1].pageX,t=j[0].pageY-j[1].pageY,n=Math.sqrt(e*e+t*t);E.set(0,n)}function X(){r.enableZoom&&Y(),r.enablePan&&J()}function Z(){r.enableZoom&&Y(),r.enableRotate&&fe()}function Q(e){if(j.length==1)b.set(e.pageX,e.pageY);else{let t=ke(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);b.set(n,r)}S.subVectors(b,y).multiplyScalar(r.rotateSpeed);let t=r.domElement;t&&(re(2*Math.PI*S.x/t.clientHeight),ie(2*Math.PI*S.y/t.clientHeight)),y.copy(b)}function pe(e){if(j.length==1)w.set(e.pageX,e.pageY);else{let t=ke(e),n=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);w.set(n,r)}T.subVectors(w,C).multiplyScalar(r.panSpeed),I(T.x,T.y),C.copy(w)}function me(e){let t=ke(e),n=e.pageX-t.x,i=e.pageY-t.y,a=Math.sqrt(n*n+i*i);D.set(0,a),O.set(0,(D.y/E.y)**+r.zoomSpeed),R(O.y),E.copy(D)}function he(e){r.enableZoom&&me(e),r.enablePan&&pe(e)}function ge(e){r.enableZoom&&me(e),r.enableRotate&&Q(e)}function _e(e){var t,n;r.enabled!==!1&&(j.length===0&&((t=r.domElement)==null||t.ownerDocument.addEventListener(`pointermove`,ve),(n=r.domElement)==null||n.ownerDocument.addEventListener(`pointerup`,$)),Ee(e),e.pointerType===`touch`?Ce(e):ye(e))}function ve(e){r.enabled!==!1&&(e.pointerType===`touch`?we(e):be(e))}function $(e){var t,n,i;De(e),j.length===0&&((t=r.domElement)==null||t.releasePointerCapture(e.pointerId),(n=r.domElement)==null||n.ownerDocument.removeEventListener(`pointermove`,ve),(i=r.domElement)==null||i.ownerDocument.removeEventListener(`pointerup`,$)),r.dispatchEvent(c),u=l.NONE}function ye(e){let t;switch(e.button){case 0:t=r.mouseButtons.LEFT;break;case 1:t=r.mouseButtons.MIDDLE;break;case 2:t=r.mouseButtons.RIGHT;break;default:t=-1}switch(t){case o.DOLLY:if(r.enableZoom===!1)return;ue(e),u=l.DOLLY;break;case o.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(r.enablePan===!1)return;U(e),u=l.PAN}else{if(r.enableRotate===!1)return;H(e),u=l.ROTATE}break;case o.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(r.enableRotate===!1)return;H(e),u=l.ROTATE}else{if(r.enablePan===!1)return;U(e),u=l.PAN}break;default:u=l.NONE}u!==l.NONE&&r.dispatchEvent(a)}function be(e){if(r.enabled!==!1)switch(u){case l.ROTATE:if(r.enableRotate===!1)return;W(e);break;case l.DOLLY:if(r.enableZoom===!1)return;G(e);break;case l.PAN:if(r.enablePan===!1)return;K(e)}}function xe(e){r.enabled===!1||r.enableZoom===!1||u!==l.NONE&&u!==l.ROTATE||(e.preventDefault(),r.dispatchEvent(a),de(e),r.dispatchEvent(c))}function Se(e){r.enabled!==!1&&r.enablePan!==!1&&q(e)}function Ce(e){switch(Oe(e),j.length){case 1:switch(r.touches.ONE){case m.ROTATE:if(r.enableRotate===!1)return;fe(),u=l.TOUCH_ROTATE;break;case m.PAN:if(r.enablePan===!1)return;J(),u=l.TOUCH_PAN;break;default:u=l.NONE}break;case 2:switch(r.touches.TWO){case m.DOLLY_PAN:if(r.enableZoom===!1&&r.enablePan===!1)return;X(),u=l.TOUCH_DOLLY_PAN;break;case m.DOLLY_ROTATE:if(r.enableZoom===!1&&r.enableRotate===!1)return;Z(),u=l.TOUCH_DOLLY_ROTATE;break;default:u=l.NONE}break;default:u=l.NONE}u!==l.NONE&&r.dispatchEvent(a)}function we(e){switch(Oe(e),u){case l.TOUCH_ROTATE:if(r.enableRotate===!1)return;Q(e),r.update();break;case l.TOUCH_PAN:if(r.enablePan===!1)return;pe(e),r.update();break;case l.TOUCH_DOLLY_PAN:if(r.enableZoom===!1&&r.enablePan===!1)return;he(e),r.update();break;case l.TOUCH_DOLLY_ROTATE:if(r.enableZoom===!1&&r.enableRotate===!1)return;ge(e),r.update();break;default:u=l.NONE}}function Te(e){r.enabled!==!1&&e.preventDefault()}function Ee(e){j.push(e)}function De(e){delete M[e.pointerId];for(let t=0;t<j.length;t++)if(j[t].pointerId==e.pointerId){j.splice(t,1);return}}function Oe(e){let t=M[e.pointerId];t===void 0&&(t=new _,M[e.pointerId]=t),t.set(e.pageX,e.pageY)}function ke(e){let t=e.pointerId===j[0].pointerId?j[1]:j[0];return M[t.pointerId]}this.dollyIn=(e=N())=>{z(e),r.update()},this.dollyOut=(e=N())=>{R(e),r.update()},this.getScale=()=>g,this.setScale=e=>{L(e),r.update()},this.getZoomScale=()=>N(),t!==void 0&&this.connect(t),this.update()}},I=new r,L=new x,R=class extends c{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type=`LineSegmentsGeometry`,this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute(`position`,new a([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute(`uv`,new a([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new v(t,6,1);return this.setAttribute(`instanceStart`,new y(n,3,0)),this.setAttribute(`instanceEnd`,new y(n,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));let r=new v(n,t*2,1);return this.setAttribute(`instanceColorStart`,new y(r,t,0)),this.setAttribute(`instanceColorEnd`,new y(r,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new g(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new r);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),I.setFromBufferAttribute(t),this.boundingBox.union(I))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new u),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)L.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(L)),L.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(L));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.`,this)}}toJSON(){}applyMatrix(e){return console.warn(`THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().`),this.applyMatrix4(e)}},z=class extends R{constructor(){super(),this.isLineGeometry=!0,this.type=`LineGeometry`}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e,t=3){let n=e.length-t,r=new Float32Array(2*n);if(t===3)for(let i=0;i<n;i+=t)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5];else for(let i=0;i<n;i+=t)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5],r[2*i+6]=e[i+6],r[2*i+7]=e[i+7];return super.setColors(r,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}},B=class extends S{constructor(t){super({type:`LineMaterial`,uniforms:b.clone(b.merge([e.common,e.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new _(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${A>=154?`colorspace_fragment`:`encodings_fragment`}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA=`1`:delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return`WORLD_UNITS`in this.defines},set:function(e){e===!0?this.defines.WORLD_UNITS=``:delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return`USE_DASH`in this.defines},set(e){!!e!=`USE_DASH`in this.defines&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH=``:delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return`USE_ALPHA_TO_COVERAGE`in this.defines},set:function(e){!!e!=`USE_ALPHA_TO_COVERAGE`in this.defines&&(this.needsUpdate=!0),e===!0?(this.defines.USE_ALPHA_TO_COVERAGE=``,this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(t)}},V=new d,H=new x,ue=new x,U=new d,W=new d,G=new d,K=new x,de=new f,q=new p,fe=new x,J=new r,Y=new u,X=new d,Z,Q;function pe(e,t,n){return X.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),X.multiplyScalar(1/X.w),X.x=Q/n.width,X.y=Q/n.height,X.applyMatrix4(e.projectionMatrixInverse),X.multiplyScalar(1/X.w),Math.abs(Math.max(X.x,X.y))}function me(e,t){let n=e.matrixWorld,r=e.geometry,i=r.attributes.instanceStart,a=r.attributes.instanceEnd,o=Math.min(r.instanceCount,i.count);for(let r=0,s=o;r<s;r++){q.start.fromBufferAttribute(i,r),q.end.fromBufferAttribute(a,r),q.applyMatrix4(n);let o=new x,s=new x;Z.distanceSqToSegment(q.start,q.end,s,o),s.distanceTo(o)<Q*.5&&t.push({point:s,pointOnLine:o,distance:Z.origin.distanceTo(s),object:e,face:null,faceIndex:r,uv:null,[j]:null})}}function he(e,t,n){let r=t.projectionMatrix,i=e.material.resolution,a=e.matrixWorld,o=e.geometry,s=o.attributes.instanceStart,c=o.attributes.instanceEnd,l=Math.min(o.instanceCount,s.count),u=-t.near;Z.at(1,G),G.w=1,G.applyMatrix4(t.matrixWorldInverse),G.applyMatrix4(r),G.multiplyScalar(1/G.w),G.x*=i.x/2,G.y*=i.y/2,G.z=0,K.copy(G),de.multiplyMatrices(t.matrixWorldInverse,a);for(let t=0,o=l;t<o;t++){if(U.fromBufferAttribute(s,t),W.fromBufferAttribute(c,t),U.w=1,W.w=1,U.applyMatrix4(de),W.applyMatrix4(de),U.z>u&&W.z>u)continue;if(U.z>u){let e=U.z-W.z,t=(U.z-u)/e;U.lerp(W,t)}else if(W.z>u){let e=W.z-U.z,t=(W.z-u)/e;W.lerp(U,t)}U.applyMatrix4(r),W.applyMatrix4(r),U.multiplyScalar(1/U.w),W.multiplyScalar(1/W.w),U.x*=i.x/2,U.y*=i.y/2,W.x*=i.x/2,W.y*=i.y/2,q.start.copy(U),q.start.z=0,q.end.copy(W),q.end.z=0;let o=q.closestPointToPointParameter(K,!0);q.at(o,fe);let l=C.lerp(U.z,W.z,o),d=l>=-1&&l<=1,f=K.distanceTo(fe)<Q*.5;if(d&&f){q.start.fromBufferAttribute(s,t),q.end.fromBufferAttribute(c,t),q.start.applyMatrix4(a),q.end.applyMatrix4(a);let r=new x,i=new x;Z.distanceSqToSegment(q.start,q.end,i,r),n.push({point:i,pointOnLine:r,distance:Z.origin.distanceTo(i),object:e,face:null,faceIndex:t,uv:null,[j]:null})}}}var ge=class extends l{constructor(e=new R,t=new B({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type=`LineSegments2`}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)H.fromBufferAttribute(t,e),ue.fromBufferAttribute(n,e),r[i]=i===0?0:r[i-1],r[i+1]=r[i]+H.distanceTo(ue);let i=new v(r,2,1);return e.setAttribute(`instanceDistanceStart`,new y(i,1,0)),e.setAttribute(`instanceDistanceEnd`,new y(i,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;r===null&&!n&&console.error(`LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.`);let i=e.params.Line2===void 0?0:e.params.Line2.threshold||0;Z=e.ray;let a=this.matrixWorld,o=this.geometry,s=this.material;Q=s.linewidth+i,o.boundingSphere===null&&o.computeBoundingSphere(),Y.copy(o.boundingSphere).applyMatrix4(a);let c;if(c=n?Q*.5:pe(r,Math.max(r.near,Y.distanceToPoint(Z.origin)),s.resolution),Y.radius+=c,Z.intersectsSphere(Y)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),J.copy(o.boundingBox).applyMatrix4(a);let l;l=n?Q*.5:pe(r,Math.max(r.near,J.distanceToPoint(Z.origin)),s.resolution),J.expandByScalar(l),Z.intersectsBox(J)!==!1&&(n?me(this,t):he(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(V),this.material.uniforms.resolution.value.set(V.z,V.w))}},_e=class extends ge{constructor(e=new z,t=new B({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type=`Line2`}};export{R as a,te as c,z as i,O as l,ge as n,le as o,B as r,k as s,_e as t};