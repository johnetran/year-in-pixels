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

  function getYear() {
    var now = new Date();
    return now.getFullYear();
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
    blockchain.setMoods(getYear(), moods, handleSetMoods);

  }
  function handleSetMoods(resp){
    if (resp){
      if (typeof resp == "string" && resp.startsWith("Error")){
        setStatus("Unable to save to blockchain: " + resp, "red")
        return;
      }
    }
    console.log(resp);
  }

  function loadMoodCalendar(moodCalendar) {
    if (moodCalendar){
      setMoods(moodCalendar);
    }
    else{
      blockchain.getMoods(getYear(), handleGetMoods);
    }
  }
  function handleGetMoods(resp){
    if (resp){
      if (resp.result){
        setMoods(resp.result.split(''));
      }
      else if (resp.execute_err){
        if (resp.execute_err == "contract check failed"){
          setStatus("Wrong Nebulas Network - In your WebExtensionWallet, please select the " + blockchain.nebNetwork, "red")
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
  function setQuoteOfTheDay() {
    $.ajax({
      url : "https://quotes.rest/qod",
      dataType: "json",
      type: "GET",
      success: function(data) {
        var content = data["contents"]["quotes"][0];
        var quote = content["quote"];
        var author = content["author"];
        $("#quoteOfTheDay").html("<p>\""+quote+"\"</p><p class='author'>—"+author+"</p>");
      }
    });
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
        updateMoodCalendar();
        createAvgChart();
        initDayMood();
        
        //$dayMood.trigger('change');
        
        $("#importMoodText").val('');
        $("#importDialog").fadeOut('fast', function() {
          alert('The import was successful!');
        });
      }
    } else {
      alert("We're sorry.\nThe data is not valid. Please try again.");
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
      updateMoodCalendar();
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
  setQuoteOfTheDay();
  createAvgChart();
})();