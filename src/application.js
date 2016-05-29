(function($) {
	function draw() {
		var sp = output.getData().annotation.object;
		var ap = mouse.getCoordinate();
		image.draw(sp, ap);
		return;
	}
	// canvas mouse event
	$(document).on('mousedown', '#canvas', function(e) {
		if (!mouse.isDown()) {
			mouse.start(e.offsetX, e.offsetY);
			draw();
		}
	}).on('mouseup', '#canvas', function(e) {
		if (mouse.isDown()) {
			mouse.move(e.offsetX, e.offsetY);
			var p = mouse.getCoordinate();
			if (p.xmin != p.xmax && p.ymin != p.ymax) {
				output.pushObject(p)
			}
			mouse.end();
			draw();
		}
	}).on('mousemove', '#canvas', function(e) {
		if (mouse.isDown()) {
			mouse.move(e.offsetX, e.offsetY);
			draw();
		}
	}).on('mouseleave', '#canvas', function(e) {
		if (mouse.isDown()) {
			mouse.end();
			draw();
		}
	});
	// download button event
	$(document).on('click', '#yml', function() {
		var obj = output.getData();
		download.yml(obj, 'download.yml');
	}).on('click', '#xml', function() {
		var obj = output.getData();
		download.xml(obj, 'download.xml');
	}).on('click', '#json', function() {
		var obj = output.getData();
		download.json(obj, 'download.json');
	});
	// bndbox delete button event
	$(document).on('click', '#delete', function() {
		var item = $('#objectBndbox').val();
		output.deleteObject(item);
		draw();
	}).on('click', '#alldelete', function() {
		output.allDeleteObject();
		draw();
	});
	// file event
	$(document).on('change', '#file', function() {
		output.allDeleteObject();
		image.read(this.files[0], function() {
			$('#filename').val(image.info().name).change();
			$('#sizeWidth').val(image.info().width).change();
			$('#sizeHeight').val(image.info().height).change();
			draw();
		});
	});
	// input event
	$(document).on('change', 'input[type="text"]', function() {
		var id = $(this).attr('id');
		var val = $(this).val();
		output.setData(id, val);
	})

})(jQuery);