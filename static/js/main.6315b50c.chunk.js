(this["webpackJsonpelo-rating"]=this["webpackJsonpelo-rating"]||[]).push([[0],{64:function(e,t,a){e.exports=a(80)},69:function(e,t,a){},70:function(e,t,a){},80:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),i=a(7),l=a.n(i),s=(a(69),a(43)),o=a(42),c=a(32),u=a(38),m=a(39),h=a(113),d=a(117),v=a(125),g=a(124),f=a(123),p=a(119),b=a(122),y=a(126),E=a(118),w=(a(70),a(41)),_=a.n(w);a(72);_.a.initializeApp({apiKey:"AIzaSyAgCVdrbzL6Qcc5byXkkABSm4oUAonDWhs",authDomain:"elo-rating-b8532.firebaseapp.com",databaseURL:"https://elo-rating-b8532.firebaseio.com",projectId:"elo-rating-b8532",storageBucket:"elo-rating-b8532.appspot.com",messagingSenderId:"1089038380501",appId:"1:1089038380501:web:66b47d2dd736f330f8615c"});var k=_.a,S=a(52),O=a.n(S),j=k.database(),C=function(){function e(t){if(Object(u.a)(this,e),0===t.length)this.list=[];else{this.list=t.length>0?[t[0]]:[];for(var a=1;a<t.length;a++)this.add_player(t[a])}}return Object(m.a)(e,[{key:"add_player",value:function(e){if(this.list[0].rating<e.rating)this.list.unshift(e);else{for(var t=1;t<this.list.length&&this.list[t].rating>e.rating;)t+=1;this.list.splice(t,0,e)}}},{key:"update_rating",value:function(e,t){for(var a=0;a<this.list.length&&this.list[a].name!==e;)a+=1;if(a===this.list.length)throw"Name not found";var n=this.list[a];this.list.splice(a,1),n.rating+=t,this.add_player(n)}}]),e}(),N=function(e){var t=e.value;return r.a.createElement(h.a,{value:t,onChange:function(t,a){e.update(a)},showLabels:!0,className:"bottom-nav"},r.a.createElement(d.a,{label:"Leaderboard"}),r.a.createElement(d.a,{label:"Report Game"}),r.a.createElement(d.a,{label:"History"}),r.a.createElement(d.a,{label:"Log in"}))},M=function(e){var t=e.players.map((function(e,t){return r.a.createElement("li",{key:e.username},e.name,", MMR: ",e.rating,", Games played: ",e.games_played)}));return r.a.createElement("ol",null,t)},I=Object(E.a)((function(e){return{formControl:{margin:e.spacing(1),minWidth:120},selectEmpty:{marginTop:e.spacing(2)}}})),L=function(e){var t=I(),a=r.a.useState(""),n=Object(c.a)(a,2),i=n[0],l=n[1],s=r.a.useState(""),o=Object(c.a)(s,2),u=o[0],m=o[1],h=function(t){for(var a=[],n=0;n<e.players.length;n++)e.players[n].username!==t&&a.push(r.a.createElement(g.a,{value:e.players[n].username},e.players[n].name));return a};return r.a.createElement("div",{className:"selectors"},r.a.createElement(p.a,{className:t.formControl},r.a.createElement(v.a,{id:"winner-select-label"},"Winner"),r.a.createElement(f.a,{labelId:"winner-select-label",id:"winner-select",value:i,onChange:function(e){return l(e.target.value)},className:"select"},h(u))),r.a.createElement(p.a,{className:t.formControl},r.a.createElement(v.a,{id:"loser-select-label"},"Loser"),r.a.createElement(f.a,{labelId:"loser-select-label",id:"loser-select",value:u,onChange:function(e){return m(e.target.value)},className:"select"},h(i))),r.a.createElement(b.a,{variant:"contained",color:"primary",onClick:function(){return e.submit(i,u)}},"Submit"))},A=function(e){Object(s.a)(a,e);var t=Object(o.a)(a);function a(e){var n;return Object(u.a)(this,a),(n=t.call(this,e)).state={history:[]},n}return Object(m.a)(a,[{key:"componentDidMount",value:function(){var e=this;j.ref("history").limitToLast(5).once("value",(function(t){console.log("here"),e.setState((function(){var e=[];return t.forEach((function(t){e.push(t.toJSON())})),{history:e.reverse()}}))}))}},{key:"make_list",value:function(){return this.state.history.map((function(e,t){return r.a.createElement("li",{key:e.key},e.date,": ",e.winner," beats ",e.loser,", +/- ",e.mmr_change," MMR")}))}},{key:"render",value:function(){return r.a.createElement("ul",null,this.make_list())}}]),a}(r.a.Component),D=function(e){var t=r.a.useState(""),a=Object(c.a)(t,2),n=a[0],i=a[1],l=r.a.useState(""),s=Object(c.a)(l,2),o=s[0],u=s[1];return r.a.createElement("div",{className:"selectors"},r.a.createElement(y.a,{id:"username-input",label:"Username",type:"search",onChange:function(e){return i(e.target.value)}}),r.a.createElement(y.a,{id:"password-input",label:"Password",type:"password",onChange:function(e){return u(e.target.value)}}),r.a.createElement(b.a,{variant:"contained",color:"primary",onClick:function(){return e.submit(n,o)}},"Submit"))},W=function(e){return[r.a.createElement(M,{players:e.leaderboard.list}),r.a.createElement(L,{players:e.leaderboard.list,submit:e.submit}),r.a.createElement(A,null),r.a.createElement(D,{submit:e.login})][e.view]},B=function(e){Object(s.a)(a,e);var t=Object(o.a)(a);function a(e){var n;return Object(u.a)(this,a),(n=t.call(this,e)).state={current_view:0,players:[],leaderboard:new C([]),user:null},n}return Object(m.a)(a,[{key:"componentDidMount",value:function(){var e=this;j.ref("users").orderByChild("rating").on("value",(function(t){e.setState((function(){var e=[];t.forEach((function(t){var a=t.toJSON();a.username=t.key,e.push(a)}));var a=new C(e);return{players:e,leaderboard:a}}))}))}},{key:"login",value:function(e,t){for(var a=0;a<this.state.players.length&&this.state.players[a].username!==e;)a+=1;a!==this.state.players.length?O()(t)===this.state.players[a].password?this.setState({current_view:0,user:e}):alert("Password is incorrect"):alert("Username is incorrect")}},{key:"change_current_view",value:function(e){this.setState({current_view:e})}},{key:"add_game",value:function(e,t){var a=this;null!==this.state.user?(j.ref("users").once("value").then((function(n){if(n.hasChild(e)&&n.hasChild(t)){var r=n.child(e+"/rating").val(),i=n.child(t+"/rating").val(),l=n.child(e+"/games_played").val(),s=n.child(t+"/games_played").val(),o=n.child(e+"/name").val(),c=n.child(t+"/name").val(),u=function(e,t){return 1/(1+Math.pow(10,(e-t)/400))}(r,i),m=Math.round(50*u),h=new Date,d=j.ref("history").push().key,v={winner:o,loser:c,posted_by:a.state.user,mmr_change:m,date:(h.getMonth()+1).toString()+"/"+h.getDate().toString()};console.log("mmrW: "+r.toString()),console.log(d);var g={};g["/history/"+d]=v,g["users/"+e+"/rating"]=r+m,g["users/"+t+"/rating"]=i-m,g["users/"+e+"/games_played"]=l+1,g["users/"+t+"/games_played"]=s+1,j.ref().update(g)}})),this.change_current_view(0)):alert("You need to be logged in")}},{key:"render",value:function(){var e=this;return r.a.createElement("div",{className:"App"},r.a.createElement("div",{className:"content-container"},r.a.createElement(W,{leaderboard:this.state.leaderboard,view:this.state.current_view,submit:function(t,a){return e.add_game(t,a)},login:function(t,a){return e.login(t,a)}})),r.a.createElement("div",{className:"footer"},r.a.createElement(N,{value:this.state.current_view,update:function(t){return e.change_current_view(t)}})))}}]),a}(r.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(B,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[64,1,2]]]);
//# sourceMappingURL=main.6315b50c.chunk.js.map