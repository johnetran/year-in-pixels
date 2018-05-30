"use strict";

const TESTNET = "Testnet";
const MAINNET = "Mainnet";
//const DEFAULT_NEBNET = MAINNET;
const DEFAULT_NEBNET = TESTNET;

const CONTRACTADDR_TESTNET = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
const CONTRACTADDR_MAINNET = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

const RPC_TESTNET = "https://testnet.nebulas.io";
const RPC_MAINNET = "https://mainnet.nebulas.io";

var nebulas = require("nebulas");
var NebPay = require("nebpay");

const NAS_FACTOR = "1e18";

var blockchain = function () {

	if (this.webExtensionInstalled()){
		this.neb = new nebulas.Neb();
		this.nebPay = new NebPay();
		this.serialNumber = "";
		//this.callbackUrl = NebPay.config.mainnetUrl;
		this.nebNetwork = DEFAULT_NEBNET;
		this.callbackUrl = DEFAULT_NEBNET == TESTNET ? NebPay.config.testnetUrl : NebPay.config.mainnetUrl ;
		this.contractAddr = DEFAULT_NEBNET == TESTNET ? CONTRACTADDR_TESTNET : CONTRACTADDR_MAINNET;
		this.neb.setRequest(new nebulas.HttpRequest(DEFAULT_NEBNET == TESTNET ? RPC_TESTNET : RPC_MAINNET));
		console.log(DEFAULT_NEBNET + " selected: " + this.callbackUrl)	
	}
};

blockchain.prototype = {
	selectMainnet: function () {
		if (!this.webExtensionInstalled()) return;

		this.nebNetwork = MAINNET;
		this.callbackUrl = NebPay.config.mainnetUrl;
		this.contractAddr = CONTRACTADDR_MAINNET;
		this.neb.setRequest(new nebulas.HttpRequest(RPC_MAINNET));
		console.log("Mainnet selected: " + this.callbackUrl)
	},
	selectTestnet: function () {
		if (!this.webExtensionInstalled()) return;

		this.nebNetwork = TESTNET;
		this.callbackUrl = NebPay.config.testnetUrl;
		this.contractAddr = CONTRACTADDR_TESTNET;
		this.neb.setRequest(new nebulas.HttpRequest(RPC_TESTNET));
		console.log("Testnet selected: " + this.callbackUrl)
	},

	getMoods: function (year, callback, showqr=false)  {
		if (!this.webExtensionInstalled()) return;

		var args = [year];
		var argsText = JSON.stringify(args);

		var to = this.contractAddr;
		var value = 0;
		var callFunction = "getMoods";
		var callArgs = argsText;
		this.serialNumber = this.nebPay.simulateCall(to, value, callFunction, callArgs, {
			qrcode: {
				showQRCode: showqr
			},
			goods: {
				name: "getMoods",
				desc: "blockchain.getMoods"
			},
			callback: this.callbackUrl,
			listener: !callback ? this._getItemListenser : callback  //set listener for extension transaction result
		});

	},
	_getMoodsListenser: function(resp){
		console.log("_getMoodsListenser.resp: " + JSON.stringify(resp));
	},	

    setMoods: function (year, moods, callback, showqr=false) {

		if (!this.webExtensionInstalled()) return;

		var args = [year, moods];
		var argsText = JSON.stringify(args);

		var to = this.contractAddr;
		var value = 0;
		var callFunction = "setMoods";
		var callArgs = argsText;
		this.serialNumber = this.nebPay.call(to, value, callFunction, callArgs, {
			qrcode: {
				showQRCode: showqr
			},
			goods: {
				name: "setMoods",
				desc: "blockchain.setMoods"
			},
			callback: this.callbackUrl,
			listener: !callback ? this._setItemListenser : callback  //set listener for extension transaction result
		});

	},
	_setMoodsListenser: function(resp){
		console.log("_setMoodsListenser.resp: " + JSON.stringify(resp));
		blockchain.refresh();
	},

	echo: function(echoText, callback, showqr=false){
		if (!this.webExtensionInstalled()) return;

		var args = [echoText];
		var argsText = JSON.stringify(args);

		var to = this.contractAddr;
		var value = 0;
		var callFunction = "echo";
		var callArgs = argsText;
		this.serialNumber = this.nebPay.simulateCall(to, value, callFunction, callArgs, {
			qrcode: {
				showQRCode: showqr
			},
			goods: {
				name: "echo",
				desc: "blockchain.echo"
			},
			callback: this.callbackUrl,
			listener: !callback ? this._echoListenser : callback //set listener for extension transaction result
		});
	},
	_echoListenser: function(resp){
		console.log("_echoListenser.resp: " + JSON.stringify(resp));
	},

	refresh: function(userObj, successCB, errorCB){
		if (!this.webExtensionInstalled()) return;

		this.nebPay.queryPayInfo(this.serialNumber,{callback: this.callbackUrl})   //search transaction result from server (result upload to server by app)
		.then(function (resp) {
			if (successCB){
				successCB(userObj, resp);
			}
			console.log("refresh.resp: " + JSON.stringify(resp))
		})
		.catch(function (err) {
			if (errorCB){
				errorCB(userObj, err);
			}
			console.log("error:" + err);
		});
	},

	isMobile: function(){
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;	
	},

	webExtensionInstalled: function(){
		return !(typeof(webExtensionWallet) === "undefined");
	}


};

var blockchain = new blockchain();
