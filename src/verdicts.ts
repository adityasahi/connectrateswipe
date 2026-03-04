import { VerdictMeta } from "./types";

export const VERDICTS: VerdictMeta[] = [
  { id:"strong_yes", label:"Strong Yes",   emoji:"🎯", sub:"Right person + right ICP",  cls:"v-gy", key:"1", anim:"anim-right", flCls:"fl-gy", hbCls:"hb-gy", bbCls:"bb-gy", pFit:1, persF:1 },
  { id:"yes_exc",    label:"Yes (Exc.)",   emoji:"✅", sub:"Like them; pattern is off",  cls:"v-ye", key:"2", anim:"anim-right", flCls:"fl-ye", hbCls:"hb-ye", bbCls:"bb-ye", pFit:0, persF:1 },
  { id:"pat_only",   label:"Pattern Only", emoji:"📐", sub:"Right profile; not them",    cls:"v-po", key:"3", anim:"anim-up",    flCls:"fl-po", hbCls:"hb-po", bbCls:"bb-po", pFit:1, persF:0 },
  { id:"soft_no",    label:"Soft No",      emoji:"🤔", sub:"Borderline; needs context",  cls:"v-sn", key:"4", anim:"anim-left",  flCls:"fl-sn", hbCls:"hb-sn", bbCls:"bb-sn", pFit:0, persF:0 },
  { id:"hard_no",    label:"Hard No",      emoji:"❌", sub:"Wrong profile entirely",      cls:"v-hn", key:"5", anim:"anim-left",  flCls:"fl-hn", hbCls:"hb-hn", bbCls:"bb-hn", pFit:0, persF:0 },
  { id:"skip",       label:"Skip",         emoji:"⏭️", sub:"Decide later",               cls:"v-sk", key:"S", anim:"anim-up",    flCls:"fl-sk", hbCls:"hb-sk", bbCls:"bb-sk", pFit:0, persF:0 },
];

export const VMAP: Record<string, VerdictMeta> = Object.fromEntries(VERDICTS.map(v => [v.id, v]));

export const KEY_VERDICT: Record<string, string> = {
  "1":"strong_yes","2":"yes_exc","3":"pat_only","4":"soft_no","5":"hard_no","s":"skip","S":"skip"
};
