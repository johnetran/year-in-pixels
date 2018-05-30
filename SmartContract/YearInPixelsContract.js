// John Tran, johntran@eightdawns.com - May 15, 2018

"use strict";

var YearInPixelsContract = function () {

    LocalContractStorage.defineMapProperty(this, "AllMoods", null);
    LocalContractStorage.defineProperties(this, {
        ownerAccount: null,         // owner account
    });
};

YearInPixelsContract.prototype = {
    init: function () {
        this.ownerAccount = Blockchain.transaction.from;
    },

    getMoods: function(year){
        var key = Blockchain.transaction.from + year;
        var moods = this.AllMoods.get(key);
        return moods;
    },

    setMoods: function (year, moods) {
        this._denyValue();

        if (moods && moods.length == 365) {
            var key = Blockchain.transaction.from + year;
            this.AllMoods.put(key, moods);
        }
        else{
            throw new Error("invalid moods data");
        }
        
    },

    echo: function (text) {
        this._denyValue();
        return text;
    },

    _denyValue: function () {
        // in case value is sent
        if (Blockchain.transaction.value.gt(0)) {
            throw new Error("please do not send value with this call");
        }
    }
};
module.exports = YearInPixelsContract;