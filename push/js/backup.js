$(function() {
	var inputData = "";
      $("#backupButton").click( function()
           {    
           		var data = "";
           		for(i = 0; i < localStorage.length; i++){
					data = data + localStorage.getItem(i) + "*";
           		}
           		window.location = "data:text/plain," + data;
           }
      );

      	var fileInput = document.getElementById('fileInput');

		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
			var textType = /text.*/;

			if (file.type.match(textType)) {
				var reader = new FileReader();

				reader.onload = function(e) {
					console.log(reader.result);
					inputData = reader.result;
				}

				reader.readAsText(file);	
			} else {
				console.log("unsupported file type");
			}
		});

		$("#upload").click( function()
           {    
           		console.log("attempting to restore from data: " + inputData);
           		if(inputData != ""){
           		var dataArray = inputData.split("*");
           		localStorage.clear();
           		for(i = 0; i < (dataArray.length)-1; i++){
           			localStorage.setItem(i, dataArray[i]);
           		}
           		alert("backup restored");
           	}else{
           		alert("no file selected");
           		console.log("restore failed");
           	}
           }
      );
<<<<<<< HEAD

		$("#clearAll").click( function()
           {    
           		localStorage.clear();
           		alert("all investments cleared");
           }
      );

});
