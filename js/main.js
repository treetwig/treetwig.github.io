      //global variables
      var jsonData = "";

      var coinsBoughtFloat = 0;
      var costPerCoinFloat = 0;
      var moneySpent = 0;
      var currentValue = 0;
      var currentProfit = 0;
      var profit = 0;
      var added = 0;
      var firstTime = true;

      $(document).ready(function() {

        $(".hidden").hide();
        $("#startMessage").hide();


        function add(a, b) {
          return a + b;
        }

        function updateLocalStorage(keyNumL, idL, costPerCoinL, coinsBoughtL, profitL, coinNameL){
            localStorage.setItem(keyNumL, "{\"id\":\""+idL+"\", \"costPerCoin\":\""+costPerCoinL+"\", \"coinsBought\":\""+coinsBoughtL+"\", \"profit\":\""+profit+"\", \"coinName\":\""+coinNameL+"\"}");
          }

        function addElement(importedJSONData){
          console.log("loaded: " + importedJSONData);
          var obj = jQuery.parseJSON(importedJSONData);
            if(obj.coinName  != 'BTC'){
              //load altcoin~bitcoin entries

              $.ajax({
                url: "https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_" + obj.coinName + "&depth=1",
                dataType: 'json',
                async: false,
                success: function(localJSON){

                var localProfit = ((parseFloat(obj.coinsBought) * parseFloat(localJSON.asks[0][0])) - (parseFloat(obj.coinsBought) * parseFloat(obj.costPerCoin))).toFixed(8);

                $("#investmentTable tr:last").after(" <tr id=entry_" + added + "> \
                <td data-th='Name'>" + obj.coinName + "</td> \
                <td data-th='Owned'>" + obj.coinsBought + "</td> \
                <td data-th='CostPer'>" + "Ƀ" + obj.costPerCoin + "</td> \
                <td data-th='Profit'>" + "Ƀ" + localProfit + "</td> \
                <td data-th='ID'><i class='material-icons delete' style='color:#F03E3E;' id='deleteButton_"+added+"'>delete_forever</i></td> \
                </tr> ");
                console.log("loaded altcoin table");
                added++;
                firstTime = false;
              }
              });

            }else{
              //load bitcoin~usd entries
                $.ajax({
                  url: "https://poloniex.com/public?command=returnOrderBook&currencyPair=USDT_BTC&depth=1",
                  dataType: 'json',
                  async: false,
                  success: function(localJSON){

                var localProfit = ((parseFloat(obj.coinsBought) * parseFloat(localJSON.asks[0][0])) - (parseFloat(obj.coinsBought) * parseFloat(obj.costPerCoin))).toFixed(2);

                $("#investmentTable tr:last").after(" <tr id=entry_" + added + "> \
                <td data-th='Name'>" + obj.coinName + "</td> \
                <td data-th='Owned'>" + obj.coinsBought + "</td> \
                <td data-th='CostPer'>" + "$" + obj.costPerCoin + "</td> \
                <td data-th='Profit'>" + "$" + localProfit + "</td> \
                <td data-th='ID'><i class='material-icons delete' style='color:#F03E3E;' id='deleteButton_"+added+"'>delete_forever</i></td> \
                </tr> ");
                console.log("loaded bitcoin table");
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

        $("#helpicon").click(function() {
          var win = window.open('https://treetwig.github.io/help.html', '_blank');
          if (win) {
    //Browser has allowed it to be opened
            win.focus();
          } else {
    //Browser has blocked it
            alert('Please allow popups for this website');
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

        $("#addInvestment").click(function(){
          $(".hidden").show();
          $('#overlay-back').fadeIn(500);
        });

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

        $("#saveInvestment").click(function(){
          //add element to investments div on button click
          var intRegex = /^\d+$/;
          var floatRegex = /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/;

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

        if((intRegex.test(coinsBought) || floatRegex.test(coinsBought)) && (intRegex.test(costPerCoin) || floatRegex.test(costPerCoin)) && coinID){

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
        });
      });