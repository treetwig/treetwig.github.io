      //global variables
      var jsonData = "";
      var editProfit = "";
      var usdProfitArray = [];
      var btcProfitArray = [];
      var currencyArray = [];

      var intRegex = /^\d+$/;
      var floatRegex = /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/;

      var coinsBoughtFloat = 0;
      var costPerCoinFloat = 0;
      var moneySpent = 0;
      var currentValue = 0;
      var currentProfit = 0;
      var profit = 0;
      var added = 0;
      var btcvalue = 0;
      var ethvalue = 0;
      var clickEditID = 0;

      $(document).ready(function() {

        $(".hidden").hide();
        $("#startMessage").hide();

        $.ajax({
          url: "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=1",
          dataType: 'json',
          async: false,
          success: function(pricejson){
              btcvalue = pricejson.asks[0][0];
            }
        });

        $.ajax({
          url: "https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH&depth=1",
          dataType: 'json',
          async: false,
          success: function(pricejson){
              ethvalue = pricejson.asks[0][0];
            }
        });

        Object.size = function(obj){
          var size = 0, key;
          for (key in obj){
            if (obj.hasOwnProperty(key)) size++;
          }
          return size;
        };

        $.ajax({
          url: "https://poloniex.com/public?command=returnCurrencies",
          dataType: 'json',
          async: false,
          success: function(currencyjson){
              for (var i = Object.size(currencyjson) - 1; i >= 0; i--) {
                currencyArray[i] = Object.keys(currencyjson)[i];
              }
            }
        });

        // Thanks to user187291 on StackOverflow
        function getPrecision(scinum) {
          var arr = new Array();
          // Get the exponent after 'e', make it absolute.  
          arr = scinum.split('e');
          var exponent = Math.abs(arr[1]);

          // Add to it the number of digits between the '.' and the 'e'
          // to give our required precision.
          var precision = new Number(exponent);
          arr = arr[0].split('.');
          precision += arr[1].length;

          return precision;
        }

        function add(a, b) {
          return a + b;
        }

        function updateLocalStorage(keyNumL, idL, costPerCoinL, coinsBoughtL, profitL, coinNameL){
            localStorage.setItem(keyNumL, "{\"id\":\""+idL+"\", \"costPerCoin\":\""+costPerCoinL+"\", \"coinsBought\":\""+coinsBoughtL+"\", \"profit\":\""+profit+"\", \"coinName\":\""+coinNameL+"\"}");
          }

        function addElement(importedJSONData){
          console.log("loaded: " + importedJSONData);
          var obj = jQuery.parseJSON(importedJSONData);
          	if(obj.coinName.startsWith("*")){
          		console.log("started custom id import");
          		var CMCID = (obj.id.split("*"))[1];

          		$.ajax({
                url: "https://coinmarketcap-nexuist.rhcloud.com/api/" + CMCID,
                dataType: 'json',
                async: false,
                success: function(localJSON){
                	var coinPrice = Number(localJSON.price.btc);
                	console.log("coinprice", coinPrice);

                var localProfit = (parseFloat(obj.coinsBought) * coinPrice - (parseFloat(obj.coinsBought) * parseFloat(obj.costPerCoin))).toFixed(8);
                var usdProfit = (localProfit*parseFloat(btcvalue)).toFixed(2);
                usdProfitArray[added] = parseFloat(usdProfit);
                btcProfitArray[added] = parseFloat(localProfit);

                var costPerCoinlocal = "";
                if(obj.costPerCoin.includes("e")){
                  if (obj.costPerCoin.match(/^[-+]?[1-9]\.[0-9]+e[-]?[1-9][0-9]*$/)) {
                    costPerCoinlocal = (+obj.costPerCoin).toFixed(getPrecision(obj.costPerCoin));
                  }
                }else{
                	costPerCoinlocal = obj.costPerCoin;
                }

                $("#investmentTable tr:last").after(" <tr id=entry_" + added + "> \
                <td data-th='Name'>" + obj.coinName + "</td> \
                <td data-th='Owned'>" + obj.coinsBought + "</td> \
                <td data-th='CostPer'>" + "Ƀ" + costPerCoinlocal + "</td> \
                <td data-th='Profit'>" + "<span id='btcProfit_"+ added + "'>" + "<b>Ƀ</b>" + localProfit + "</span></td> \
                <td data-th='Profit($)'>" + "<span id='usdProfit_"+ added + "'>" + "<b>$</b>" + usdProfit + "</span></td> \
                <td data-th='ID'><i class='material-icons delete' style='color:#F03E3E;' id='deleteButton_"+added+"'>delete_forever</i></td> \
                <td data-th='Edit'><i class='material-icons edit' id='editButton_"+added+"'>edit</i></td> \
                </tr> ");

                if(localProfit < 0){
                  $('#btcProfit_' + added).css('color', '#F20000')
                }else{
                  $('#btcProfit_' + added).css('color', '#00C200')
                }
                if(usdProfit < 0){
                  $('#usdProfit_' + added).css('color', '#F20000')
                }else{
                  $('#usdProfit_' + added).css('color', '#00C200')
                }

                console.log("loaded cmcid entry");
                added++;
              }
              });

          	}
            if(obj.coinName  != 'BTC' && !obj.coinName.startsWith("*")){
              //load altcoin~bitcoin entries

              $.ajax({
                url: "https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_" + obj.coinName + "&depth=1",
                dataType: 'json',
                async: false,
                success: function(localJSON){

                console.log(obj.costPerCoin);

                var costPerCoinlocal = "";
                if(obj.costPerCoin.includes("e")){
                  if (obj.costPerCoin.match(/^[-+]?[1-9]\.[0-9]+e[-]?[1-9][0-9]*$/)) {
                    costPerCoinlocal = (+obj.costPerCoin).toFixed(getPrecision(obj.costPerCoin));
                  }
                }
                var localProfit = ((parseFloat(obj.coinsBought) * parseFloat(localJSON.asks[0][0])) - (parseFloat(obj.coinsBought) * parseFloat(obj.costPerCoin))).toFixed(8);
                var usdProfit = (localProfit*parseFloat(btcvalue)).toFixed(2);
                usdProfitArray[added] = parseFloat(usdProfit);
                btcProfitArray[added] = parseFloat(localProfit);

                if(obj.costPerCoin.includes("e")){
                $("#investmentTable tr:last").after(" <tr id=entry_" + added + "> \
                <td data-th='Name'>" + obj.coinName + "</td> \
                <td data-th='Owned'>" + obj.coinsBought + "</td> \
                <td data-th='CostPer'>" + "Ƀ" + costPerCoinlocal + "</td> \
                <td data-th='Profit'>" + "<span id='btcProfit_"+ added + "'>" + "<b>Ƀ</b>" + localProfit + "</span></td> \
                <td data-th='Profit($)'>" + "<span id='usdProfit_"+ added + "'>" + "<b>$</b>" + usdProfit + "</span></td> \
                <td data-th='ID'><i class='material-icons delete' style='color:#F03E3E;' id='deleteButton_"+added+"'>delete_forever</i></td> \
                <td data-th='Edit'><i class='material-icons edit' id='editButton_"+added+"'>edit</i></td> \
                </tr> ");
              }else{
                $("#investmentTable tr:last").after(" <tr id=entry_" + added + "> \
                <td data-th='Name'>" + obj.coinName + "</td> \
                <td data-th='Owned'>" + obj.coinsBought + "</td> \
                <td data-th='CostPer'>" + "Ƀ" + obj.costPerCoin + "</td> \
                <td data-th='Profit'>" + "<span id='btcProfit_"+ added + "'>" + "<b>Ƀ</b>" + localProfit + "</span></td> \
                <td data-th='Profit($)'>" + "<span id='usdProfit_"+ added + "'>" + "<b>$</b>" + usdProfit + "</span></td> \
                <td data-th='ID'><i class='material-icons delete' style='color:#F03E3E;' id='deleteButton_"+added+"'>delete_forever</i></td> \
                <td data-th='Edit'><i class='material-icons edit' id='editButton_"+added+"'>edit</i></td> \
                </tr> ");
              }


                if(localProfit < 0){
                  $('#btcProfit_' + added).css('color', '#F20000')
                }else{
                  $('#btcProfit_' + added).css('color', '#00C200')
                }
                if(usdProfit < 0){
                  $('#usdProfit_' + added).css('color', '#F20000')
                }else{
                  $('#usdProfit_' + added).css('color', '#00C200')
                }

                console.log("loaded altcoin entry");
                added++;
              }
              });

            }
            if(obj.coinName == "BTC"){
              //load bitcoin~usd entries
                $.ajax({
                  url: "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=1",
                  dataType: 'json',
                  async: false,
                  success: function(localJSON){

                var usdProfit = ((parseFloat(obj.coinsBought) * parseFloat(localJSON.asks[0][0])) - (parseFloat(obj.coinsBought) * parseFloat(obj.costPerCoin))).toFixed(2);
                var localProfit = (usdProfit/parseFloat(btcvalue)).toFixed(8);
                usdProfitArray[added] =parseFloat(usdProfit);
                btcProfitArray[added] = parseFloat(localProfit);

                $("#investmentTable tr:last").after(" <tr id=entry_" + added + "> \
                <td data-th='Name'>" + obj.coinName + "</td> \
                <td data-th='Owned'>" + obj.coinsBought + "</td> \
                <td data-th='CostPer'>" + "$" + obj.costPerCoin + "</td> \
                <td data-th='Profit'>" + "<span id='btcProfit_"+ added + "'>" + "<b>Ƀ</b>" + localProfit + "</span></td> \
                <td data-th='Profit($)'>" + "<span id='usdProfit_"+ added + "'>" + "<b>$</b>" + usdProfit + "</span></td> \
                <td data-th='ID'><i class='material-icons delete' style='color:#F03E3E;' id='deleteButton_"+added+"'>delete_forever</i></td> \
                <td data-th='Edit'><i class='material-icons edit' id='editButton_"+added+"'>edit</i></td> \
                </tr> ");

                if(localProfit < 0){
                  $('#btcProfit_' + added).css('color', '#F20000')
                }else{
                  $('#btcProfit_' + added).css('color', '#00C200')
                }
                if(usdProfit < 0){
                  $('#usdProfit_' + added).css('color', '#F20000')
                }else{
                  $('#usdProfit_' + added).css('color', '#00C200')
                }

                console.log("loaded bitcoin entry");
                added++;
              }
              });
            }
        }

        var storageLength = localStorage.length;
        console.log("localStorage length: " + storageLength);
        if(window.localStorage.length != null){
        for(var i = 0, len = localStorage.length; i < len; ++i){
          
          addElement(localStorage[i]);
        }
      }
 
 // Handle infobox styling and numbers
      var totalUSDProfit = parseFloat((usdProfitArray.reduce(add, 0)).toFixed(2));
      var totalBTCProfit = parseFloat((btcProfitArray.reduce(add, 0)).toFixed(8));
      console.log("total usd profit and btc profit: ", totalUSDProfit, ",", totalBTCProfit);
      $('#usdProfitLabel').text("$" + totalUSDProfit);
      $('#btcProfitLabel').text("Ƀ" + totalBTCProfit);

      if(totalUSDProfit < 0){
        $('#usdProfitLabel').css('color', '#F20000');
      }
      else{
        $('#usdProfitLabel').css('color', '#00C200');
      }

      if(totalBTCProfit < 0){
        $('#btcProfitLabel').css('color', '#F20000');
      }
      else{
        $('#btcProfitLabel').css('color', '#00C200');
      }

      $('#btcprice').text("$" + parseFloat(btcvalue).toFixed(2));
      $('#btcprice').css('color', 'orange');

      $('#ethbtcprice').text("Ƀ" + parseFloat(ethvalue).toFixed(8));
      $('#ethusdprice').text("$" + (parseFloat(ethvalue)*parseFloat(btcvalue)).toFixed(2));
      $('#ethbtcprice').css('color', '#729BF2');
      $('#ethusdprice').css('color', '#729BF2');



  // end infobox code

        $("#settingsButton").click(function() {
          var win = window.open('https://treetwig.github.io/push', '_blank');
          if (win) {
    //Browser has allowed it to be opened
            win.focus();
          } else {
    //Browser has blocked it
            alert('Please allow popups for this website!');
          }
        });

        $("#helpicon").click(function() {
          var win = window.open('https://treetwig.github.io/help.html', '_blank');
          if (win) {
    //Browser has allowed it to be opened
            win.focus();
          } else {
    //Browser has blocked it
            alert('Please allow popups for this website!');
          }
        });

        $(document).keyup(function(event) {
          if(event.which === 27) {
            $('.hidden').hide();
            $('#overlay-back').fadeOut(500);
          }
        });

        $("#closeButton").click(function(){
          $('.hidden').hide();
          $('#overlay-back').fadeOut(500);
        });

        $("#closeEditScreen").click(function(){
          $('.hidden').hide();
          $('#overlay-back').fadeOut(500);
        });

        $("#addInvestment").click(function(){
          $("#investmentScreen").show();
          $('#overlay-back').fadeIn(500);
        });

        // DELETE FUNCTION

        $(document).on('click', "i.material-icons.delete", function() {
          clickedLinkID = $(this).attr('id');
          var res = clickedLinkID.split("_");
          localStorage.removeItem(res[1]);
          var totalEntries = localStorage.length + 1;
          var resINT = parseInt(res[1]);
          console.log("total entries: " + totalEntries);
          for(var i = resINT+1; i<totalEntries; i++){
            console.log(i);
            var toDelete = localStorage.getItem(i);
            localStorage.setItem(i-1, toDelete);
            localStorage.removeItem(i);
          }
          location.reload();
        });

        // END DELETE FUNCTION

        $(document).on('click', "i.material-icons.edit", function() {
          clickedLinkID = $(this).attr('id');
          var res = clickedLinkID.split("_");
          clickedEditID = res[1];
          var storedData = localStorage.getItem(res[1]);
          var JSONobj = jQuery.parseJSON(storedData);
          console.log(JSONobj);
          var coinID = JSONobj.id;
          var cBought = JSONobj.coinsBought;
          var CPC = JSONobj.costPerCoin;

          $('#editIDTextbox').val(coinID);
          $('#editOwnedTextbox').val(cBought);
          $('#editCostPerCoinTextbox').val(CPC);

          $("#editScreen").show();
          $('#overlay-back').fadeIn(500);
        });

        $('#saveEditedInvestment').click(function() {
          var newID = $('#editIDTextbox').val().toUpperCase();
          var newCBought = $('#editOwnedTextbox').val();
          var newCPC = $('#editCostPerCoinTextbox').val();
          if((intRegex.test(newCBought) || floatRegex.test(newCBought)) && (intRegex.test(newCPC) || floatRegex.test(newCPC)) && (newID.startsWith("*"))){
          	console.log(newID, newCBought, newCPC);
          	var CMCID = (newID.split("*"))[1];
          	$.getJSON("https://coinmarketcap-nexuist.rhcloud.com/api/" + CMCID, function(json){
          		if(json.error == "Requested coin does not exist or has not been updated yet."){
          			alert("invalid coin!");
          		}else{
          		    localStorage[clickedEditID] = "{\"id\":\""+newID+"\", \"costPerCoin\":\""+newCPC+"\", \"coinsBought\":\""+newCBought+"\", \"coinName\":\""+newID+"\"}";
            		location.reload();
          		}
          	});
          }else{
          if((intRegex.test(newCBought) || floatRegex.test(newCBought)) && (intRegex.test(newCPC) || floatRegex.test(newCPC)) && (currencyArray.indexOf(newID) > -1)){
            console.log(newID, newCBought, newCPC);
            localStorage[clickedEditID] = "{\"id\":\""+newID+"\", \"costPerCoin\":\""+newCPC+"\", \"coinsBought\":\""+newCBought+"\", \"coinName\":\""+newID+"\"}";
            location.reload();
          }else{
            alert("invalid entry");
            console.log("invalid entry");
          }
      }
        });

        $("#saveInvestment").click(function(){
          //add element to investments div on button click

          var coinID = $('#coinNameTextbox').val().toUpperCase();
          var coinsBought = $('#ownedTextbox').val();
          var costPerCoin = $('#costPerCoinTextbox').val();

          function insertLocalStorage(jsonData){

          if (jsonData.error != "Invalid currency pair.") {
              console.log("valid id entered");

              if(coinID == 'BTC'){
                profit = currentProfit.toFixed(2);
              }else{
                profit = currentProfit.toFixed(8);
              }
              var coinName = coinID;

            localStorage.setItem(localStorage.length, "{\"id\":\""+coinID+"\", \"costPerCoin\":\""+costPerCoinFloat+"\", \"coinsBought\":\""+coinsBought+"\", \"profit\":\""+profit+"\", \"coinName\":\""+coinName+"\"}");
            added++
            location.reload();

          }else{
            alert("invalid id");
          }
        }

		if((intRegex.test(coinsBought) || floatRegex.test(coinsBought)) && (intRegex.test(costPerCoin) || floatRegex.test(costPerCoin)) && coinID.startsWith("*")){
          console.log("custom CMCID entered");
          var CMCID = (coinID.split("*"))[1];
          console.log("CMCID: ", CMCID);

          $.getJSON("https://coinmarketcap-nexuist.rhcloud.com/api/" + CMCID, function(json){
          	if(json.error == "Requested coin does not exist or has not been updated yet."){
          		alert("invalid coin!");
          	}else{
          	console.log(json);
          	jsonData = json;
          	coinsBoughtFloat = parseFloat(coinsBought);
            costPerCoinFloat = parseFloat(costPerCoin);
            moneySpent = coinsBoughtFloat*costPerCoinFloat;
            currentValue = coinsBoughtFloat*Number(jsonData.price.btc);
            currentProfit = currentValue-moneySpent;
            profit = 0;
          	insertLocalStorage(jsonData);
          }
          
          });
          }else{

        if((intRegex.test(coinsBought) || floatRegex.test(coinsBought)) && (intRegex.test(costPerCoin) || floatRegex.test(costPerCoin)) && coinID && (currencyArray.indexOf(coinID) > -1)){

          if(coinID != 'BTC'){

            $.getJSON("https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_" + coinID + "&depth=1",function(json){
              jsonData = json;
              coinsBoughtFloat = parseFloat(coinsBought);
              costPerCoinFloat = parseFloat(costPerCoin);
              moneySpent = coinsBoughtFloat*costPerCoinFloat;
              currentValue = coinsBoughtFloat*jsonData.asks[0][0];
              currentProfit = currentValue-moneySpent;
              profit = 0;
              insertLocalStorage(jsonData);
            });

          }else{
            $.getJSON("https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=1",function(json){
              jsonData = json;
              coinsBoughtFloat = parseFloat(coinsBought);
              costPerCoinFloat = parseFloat(costPerCoin);
              moneySpent = coinsBoughtFloat*costPerCoinFloat;
              currentValue = coinsBoughtFloat*jsonData.asks[0][0];
              currentProfit = currentValue-moneySpent;
              profit = 0;
              insertLocalStorage(jsonData);
            });
          }

        }else{
          alert('Invalid entry!');
        }
    }
        });
      });