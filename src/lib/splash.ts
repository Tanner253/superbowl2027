// Shared by the Splash (client) and the root layout (server), so it lives outside the "use client" file.
export const ENTERED_KEY = "p28_entered";
// Runs in <head> before paint so returning visitors never see the gate flash.
export const ENTERED_SCRIPT = `try{if(localStorage.getItem("${ENTERED_KEY}"))document.documentElement.dataset.entered="1"}catch(e){}`;
