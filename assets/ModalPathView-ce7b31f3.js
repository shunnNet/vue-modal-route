import{d as u,M as e,q as d,L as o,h as t}from"./index-1a611ec7.js";const m=u({components:{ModalRoute:e},props:{name:{type:String,default:"default"}},setup(n,{slots:a}){const s=d("RouterView"),l=o("ModalHashContext",!1);return o("ModalQueryContext",!1)?(console.warn("ModalPathView should not be nested in ModalQueryView."),()=>null):()=>t(s,{name:`modal-${n.name}`},{default:r=>t(e,{modalType:l?"hash":"path",components:[r.Component]},a)})}});export{m as M};