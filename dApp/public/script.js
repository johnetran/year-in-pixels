(function(){


  if (!blockchain.webExtensionInstalled()){
    setStatus(
      "The WebExtentionWall is not installed. <br/><br/>You can still interact with this dApp but nothing will be saved to the blockchain. <br/><br/>The WebExtentionWallet works with the Google Chrome desktop browser and can be downloaded here: <a href='https://github.com/ChengOrangeJu/WebExtensionWallet' target='_blank'>https://github.com/ChengOrangeJu/WebExtensionWallet</a>"
      , "red")
  }
  
  var $moodGrid = $("#moodGrid");
  var $moodItems = $moodGrid.find('a');
  var $dayMood = $("input[name=dayMood]");
  var activeMoodDay;
  var year = getYear();

  function getYear() {    
    var now = new Date();
    var year = now.getFullYear();

    var urlVars = getUrlVars();
    if (urlVars["year"]){
      var parts = urlVars["year"].split("-");
      if (parts.length > 0){
        if (!isNaN(parts[0])){
          year = parseInt(parts[0]);
        }
      }
    }

    return year;
  }
  
  function getTodayDayNumber() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    var day = Math.floor(diff / oneDay);
    return day;
  }

  function selectTodayMood() {
    var day = getTodayDayNumber();
    activeMoodDay = $moodItems.get(day - 1);
    $(activeMoodDay).addClass("active");
    setActiveDayMoodRadio();
  }

  function setActiveDayMoodRadio() {
    var value = $(activeMoodDay).attr("data-mood");
    $("input[name=dayMood][value=" + value + "]").prop('checked', true);
    initDayMood();
    //$dayMood.trigger('change');
  }
  
  function setMoods(arrayOfMoods) {
    var day = $moodGrid.find('a');
    day.each(function(i) {
      $(this).attr("data-mood", arrayOfMoods[i]) 
    });
  }

  function getMoodCalendarString() {
    return $moodGrid.find('a').map(function() { return $(this).attr("data-mood") }).get().join('');
  }
  
  function updateMoodCalendar() {
    var moods = getMoodCalendarString();
    blockchain.setMoods(year, moods, handleSetMoods);

  }
  function handleSetMoods(resp){
    if (resp){
      if (typeof resp == "string" && resp.startsWith("Error")){
        setStatus("Unable to save to blockchain: " + resp, "red")
        return;
      }

      setStatus("Saving to blockchain...", "gold");
      blockchain.startRefreshTimeout(resp, {successCB: setMoodsSuccess, errorCB: setMoodsError, progressCB: setMoodsProgress});
    }
    console.log(resp);
  }
  function setMoodsSuccess(resp){
    setStatus("Successfully saved to blockchain", "blue");
  }
  function setMoodsError(userObj, err){
    setStatus("Error saving to blockchain: " + err, "red");
  }
  function setMoodsProgress(obj, userObj, txRefreshCount){
    setStatus("Saving to blockchain ("+txRefreshCount+")...", "gold");
  }

  function loadMoodCalendar(moodCalendar) {
    if (moodCalendar){
      setMoods(moodCalendar);
    }
    else{
      blockchain.getMoods(year, handleGetMoods);
    }
  }
  function handleGetMoods(resp){
    if (resp){
      if (resp.result && resp.result != 'null'){
        var moods = JSON.parse(resp.result);
        setMoods(moods.split(''));
        setActiveDayMoodRadio();
        createAvgChart();
      }
      else if (resp.execute_err){
        if (resp.execute_err == "contract check failed"){
          setStatus("Wrong Nebulas Network - In your WebExtensionWallet, please select the " + blockchain.nebNetwork, "red")
        }
        else{
          setStatus("Error: " + resp.execute_err, "red")

        }
      }
  
    }
    console.log(resp);
  }

  function createPixelsForHeader() {
    var pixelsWidth = $("#pixels").width();
    var pixelsHeight = $("#pixels").height();

    for (var i = 0; i < 25; i++) {
      var pixelClass = "mood-" + Math.floor(Math.random()*(5-1+1)+1);;

      jQuery('<div/>', {
        class: pixelClass,
        css: {
          top: Math.floor(Math.random() * (pixelsHeight - 20)),
          left: Math.floor(Math.random() * (pixelsWidth - 20 )),
        }

      }).appendTo('#pixels');
    }
  }
  
  function setStatus(message, textColor){
    $("#status").html("<p>"+message+"</p>");
    if (textColor){
      $("#status").css({"color": textColor});
    }
  }  

  function getMonthMoodAvgArr() {
    var moods = $moodGrid.find('.item.month').map(function() {
      return $(this).find("a")
    });
    var results = [];
    moods.each(function() {
      var result = $(this).map(function() {
        var value = $(this).attr("data-mood");
        if (value !== "0") {
          return parseInt(value, 10);
        }
      }).get();
      var sum = 0;
      for (var i = 0; i < result.length; i++) {
        if (result[i]) {
          sum += result[i]
        } else {
          sum += 0;
        }
      }
      if (sum != 0) {
        var avg = sum/result.length;
      } else {
        var avg = 0;
      }
      results.push(avg);
    });
    return results;
  }
  
  function createAvgChart() {
    var data = {
      labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      series: [getMonthMoodAvgArr()]
    };
    var options = {
      axisY: {
        onlyInteger: true,
        labelInterpolationFnc: function(value, index) {
          return moodOptions[index];
        },
        stretch: true,
        offset: 50
      },
      axisX: {
        offset: 20
      },
      high: 6,
      low: 0,
      showArea: true,
      showLine: true,
      showPoint: false,
      fullWidth: true,
      chartPadding: {
        top: 0,
        right: 10
      }
    };
    new Chartist.Line('.ct-chart', data, options);
  }

function initDayMood(){

  var moodValue = $('input[name=dayMood]:checked').val();
  $(activeMoodDay).attr("data-mood", moodValue);
  
  createAvgChart();
  if (moodOptions[moodValue] != 'none') {
    var message = "Your day was <u>" + moodOptions[moodValue] + "</u>."
    $("#message").html(message);
  } else {
    var message = "You have not set a mood today."
    $("#message").html(message);
  }

}

  $moodItems.on("click", function(e) {
    e.preventDefault();
    $moodItems.removeClass("active");
    $(this).addClass("active");
    activeMoodDay = this;
    setActiveDayMoodRadio();
    //updateMoodCalendar();
  });

  $dayMood.on("change", function(e) {
    e.preventDefault();

    initDayMood()
    updateMoodCalendar();
    
  });
  
  $("#footer a").on("click", function(e) {
    e.preventDefault();
    var action = $(this).attr('data-menu');
    execMenuItem(action);
  });
  
  $(".dialog .close").on("click", function(e) {
    e.preventDefault();
    $("#importMoodText").val('');
    $(this).parent('.dialog').fadeOut('fast');
  });
  
  $("#importMoodBtn").on("click", function(e) {
    e.preventDefault();
    var moodCalendar = $("#importMoodText").val();
    if (moodCalendar.length == 365) {
      var dialog = confirm("Careful, this will clear all the current data. Are you sure?");
      if (dialog) {
        loadMoodCalendar(moodCalendar);
        createAvgChart();
        initDayMood();
        updateMoodCalendar();

        //$dayMood.trigger('change');
        
        $("#importMoodText").val('');
        $("#importDialog").fadeOut('fast', function() {
          //alert('The import was successful!');
        });
      }
    } else {
      setStatus("We're sorry.\nThe data is not valid. Please try again.", "red");
    }
  });
  
  var menu = {
    showImportDialog: function() {
      $("#importDialog").fadeIn('fast');
    },
    showExportDialog: function() {
      $("#exportDialog").fadeIn('fast');
      $("#exportMoodText").val(getMoodCalendarString());
    },
    /*
    fillDemoData: function() {
      var moodArr = Array.apply(null, Array(365)).map(function() {
        return Math.floor(Math.random()*5+1);
      });
      loadMoodCalendar(moodArr.join(''));
      updateMoodCalendar();
      createAvgChart();
      setActiveDayMoodRadio();
    },
    */
    clearAllData: function() {
      var moodArr = Array.apply(null, Array(365)).map(Number.prototype.valueOf,0);
      loadMoodCalendar(moodArr.join(''));
      createAvgChart();
      setActiveDayMoodRadio();
      updateMoodCalendar();
    },
    howAboutDialog: function() {
      $("#aboutDialog").fadeIn('fast');
    },
  }
  
  function execMenuItem(action) {
    $(".dialog").fadeOut('fast');
    switch(action) {
    case "import":
      menu.showImportDialog();
      break;
    case "export":
      menu.showExportDialog();
      break;
    case "clear":
      var dialog = confirm("Careful, this will clear all the current data. Are you sure?");
      if (dialog) {
        menu.clearAllData();
      }
      break;
    }
  }

  loadMoodCalendar();
  selectTodayMood();
  createPixelsForHeader();
  createAvgChart();
})();