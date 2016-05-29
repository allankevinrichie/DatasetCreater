/* download function */
var download = (function() {
	function json2xml(obj, parent_name) {
		var result = "";
		for ( var key in obj) {
			var name = parent_name || key;
			if (typeof (obj[key]) == "object") {
				if(Array.isArray(obj[key])){
					console.log(key)
					result += json2xml(obj[key], key);
				}else{
					result += "<" + name + ">\n";
					result += json2xml(obj[key]);
					result += "</" + name + ">\n";
				}
			} else {
				result += "<" + name + ">" + (obj[key]) + "</" + name + ">\n";
			}
		}
		return result;
	}
	function _getJsonText(obj) {
		return JSON.stringify(obj);
	}
	function _getYmlText(obj) {
		return json2yaml(obj);
	}
	function _getXmlText(obj) {
		return json2xml(obj);
	}
	function _download(data, filename) {
		var blob = new Blob([ data ], {
			type : "text/plain"
		});
		var a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.target = '_blank';
		a.download = filename;
		a.click();
		return;
	}
	function downloadYml(obj, filename) {
		var data = _getYmlText(obj);
		_download(data, filename);
	}
	function downloadXml(obj, filename) {
		var data = _getXmlText(obj);
		_download(data, filename);
	}
	function downloadJson(obj, filename) {
		var data = _getJsonText(obj);
		_download(data, filename);
	}
	return {
		yml : downloadYml,
		xml : downloadXml,
		json : downloadJson
	}
})();
/* mouse function */
var mouse = (function() {
	var x_down = 0;
	var y_down = 0;
	var x_now = 0;
	var y_now = 0;
	var flag = false;
	function isDown() {
		return flag;
	}
	function getCoordinate(){
		return {
			xmin : Math.min(x_down, x_now),
			ymin : Math.min(y_down, y_now),
			xmax : Math.max(x_down, x_now),
			ymax : Math.max(y_down, y_now)
		}
	}
	function start(x, y) {
		if(!flag){
			x_down = x;
			y_down = y
			x_now = x;
			y_now = y
			flag = true;
		}
		return;
	}
	function move(x, y) {
		if(flag){
			x_now = x;
			y_now = y;
		}
		return;
	}
	function end() {
		if(flag){
			x_down = 0;
			y_down = 0
			x_now = 0;
			y_now = 0;
			flag = false;
		}
		return;
	}
	return {
		isDown : isDown,
		getCoordinate : getCoordinate,
		start : start,
		move : move,
		end : end
	}
})();
/* output function */
var output = (function() {
	var data = {
		annotation : {
			folder : "",
			filename : "",
			source : {
				database : "",
				annotation : "",
				image : "",
				flickrid : ""
			},
			owner : {
				flickrid : "",
				name : ""
			},
			size : {
				width : "",
				height : "",
				depth : ""
			},
			segmented : "",
			object : []
		}
	};
	var object = {
		name : "",
		pose : "",
		truncated : "",
		difficult : "",
		bndbox : {}
	};
	function getData() {
		return data;
	}
	function setData(name, val) {
		switch(name){
			case "folder":
			case "filename":
			case "segmented":
				data.annotation[name] = val;
				break;
			case "sourceDatabase":
				data.annotation.source.database = val;
				break;
			case "sourceAnnotation":
				data.annotation.source.annotation = val;
				break;
			case "sourceImage":
				data.annotation.source.image = val;
				break;
			case "sourceFlickrid":
				data.annotation.source.flickrid = val;
				break;
			case "ownerFlickrid":
				data.annotation.owner.flickrid = val;
				break;
			case "ownerName":
				data.annotation.owner.name = val;
				break;
			case "sizeWidth":
				data.annotation.size.width= val;
				break;
			case "sizeHeight":
				data.annotation.size.height= val;
				break;
			case "sizeDepth":
				data.annotation.size.depth= val;
				break;
			case "objectName":
				object.name = val;
				break;
			case "objectPose":
				object.pose = val;
				break;
			case "objectTruncated":
				object.truncated = val;
				break;
			case "objectDifficult":
				object.difficult = val;
				break;
			default:
				break;
		}
		return;
	}
	function pushObject(bndbox) {
		data.annotation.object.push({
			name : object.name,
			pose : object.pose,
			truncated : object.truncated,
			difficult : object.difficult,
			bndbox : bndbox
		});
		
		return;
	}
	function allDeleteObject(){
		data.annotation.object = [];
		return;
	}
	function deleteObject(param){
		$.each(param, function(i, e) {
			data.annotation.object[e] = null;
		});
		data.annotation.object = data.annotation.object.filter(function(e, i) {
			return e !== null
		})
		return;
	}
	return {
		getData : getData,
		setData : setData,
		pushObject : pushObject,
		deleteObject : deleteObject,
		allDeleteObject : allDeleteObject
	}
})();
var image = (function() {

	var _image = new Image();
	var name = "";
	
	function read(file, callback) {
		function setImage(url) {
			_image = new Image();
			_image.onerror = function() {
				callback();
			};
			_image.onload = function() {
				callback();
			};
			_image.src = url;
			return;
		}
		if (file && file.type.match(/^image\/(png|jpeg|gif|bmp)$/)) {
			var reader = new FileReader();
			reader.onload = function() {
				var url = reader.result;
				setImage(url);
			};
			reader.readAsDataURL(file);
			name=file.name
		} else if (file && file.type.match(/^image\/(tiff)$/)) {
			var reader = new FileReader();
			reader.onload = function() {
				var tiff = new Tiff({
					buffer : reader.result
				});
				var url = tiff.toDataURL();
				tiff.close();
				setImage(url);
			};
			reader.readAsArrayBuffer(file);
			name=file.name
		} else {
			var url = "";
			setImage(url);
			name="";
		}
	}
	function draw(sp, ap) {
		function draw_canvas(sp, ap) {
			var canvas = $('#canvas')[0];
			canvas.width = _image.width;
			canvas.height = _image.height;
			var ctx = canvas.getContext("2d");
			ctx.drawImage(_image, 0, 0);
			$.each(sp, function(i, e) {
				var p = e.bndbox;
				ctx.strokeStyle = "rgb(200, 0, 0)";
				ctx.strokeRect(p.xmin, p.ymin, p.xmax - p.xmin, p.ymax - p.ymin);
			});
			if (ap) {
				ctx.strokeStyle = "rgb(0, 0, 200)";
				ctx.strokeRect(ap.xmin, ap.ymin, ap.xmax - ap.xmin, ap.ymax - ap.ymin);
			}
		}
		function draw_text(sp) {
			var text = "";
			$.each(sp, function(i, e) {
				text += '<option value="' + i + '">';
				text += '(' + e.bndbox.xmin + ',' + e.bndbox.ymin + ')';
				text += ',(' + e.bndbox.xmax + ',' + e.bndbox.ymax + ')';
				text += ',n:' + e.name;
				text += ',p:' + e.pose;
				text += ',t:' + e.truncated;
				text += ',d:' + e.difficult;
				text += '</option>';
			});
			$('#objectBndbox').html(text);
		}
		draw_canvas(sp, ap);
		draw_text(sp);
	}
	function info() {
		return {
			name : name,
			width : _image.width,
			height : _image.height
		}
	}
	return {
		read : read,
		draw : draw,
		info : info
	}
})();