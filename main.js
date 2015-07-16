var app_data = {
	data: null,
	area: null
}

function dataError() {
	$('body').children().hide();
	$('.alert').show();
}

function parseRaw(raw_data) {
	var data = [];
	var paras = raw_data.replace(/\r/g, '').split(/\n([^\S\n]*\n)+/);
	var para, rows, row, item;
	for (var i = 0; i < paras.length; i++) {
		para = paras[i];
		rows = para.split('\n');
		if (para.replace(/\s+/g, '') == "") continue;
		if (rows.length < 6) throw "Not valid data";
		item = {};

		row = rows[0].trim();
		item.name = row.replace(/\!/g, '');
		if (row.indexOf('!') >= 0) item.active = false;
		else item.active = true;

		row = rows[1].trim();
		if (row == "none") item.titles = [];
		else item.titles = row.split(' ');

		row = rows[2].trim();
		if (row == "none") item.emails = [];
		else item.emails = row.split(' ');

		row = rows[3].trim();
		item.group = row;

		row = rows[4].trim();
		if (row == "none") item.interests = [];
		else item.interests = row.split('、');
		for (var j = 0; j < item.interests.length; j++) {
			item.interests[j] = item.interests[j].replace(/\%01/g, '、');
		}

		row = rows[5].trim();
		item.link = row;

		data.push(item);
	}
	return data;
}
function parseArea(raw_area) {
	var data = {};
	var rows = raw_area.replace(/\r/g, '').split(/\n([^\S\n]+\n)*/);
	var row, row_split;
	for (var i = 0; i < rows.length; i++) {
		row = rows[i];
		if (!row) continue;
		row_split = row.split(' ');
		if (row.replace(/\s+/g, '') == "") continue;
		if (row_split.length < 2) throw "Not valid area";
		data[row_split[0]] = row_split[1];
	}
	return data;
}

function inflateData(data, area) {
	// templates
	var list_el_tpl = '<div class="list collapsed">' +
						'<div class="list-title">' +
							'<span>{group_name}</span>' +
							'<span class="icon-arrow"></span>' +
						'</div>' +
						'<div class="list-list">' +
						'</div>' +
					'</div>';
	var list_item_el_tpl = '<div class="item">' +
								'<div class="name">' +
									'<span class="name-name">{name}</span>' +
									'<span class="name-title">{titles}</span>' +
								'</div>' +
								'<div class="email">' +
									'<div class="prop"><span>邮箱</span></div>' +
									'<div class="value">' +
										'<ul class="plain">' +
										'</ul>' +
									'</div>' +
								'</div>' +
								'<div class="interest">' +
									'<div class="prop"><span>方向</span></div>' +
									'<div class="value">' +
										'<ul>' +
										'</ul>' +
									'</div>' +
								'</div>' +
								'<div class="source-page">' +
									'<a href="{link}">进入主页</a>' +
								'</div>' +
							'</div>';

	// organize
	var organized_data = {};
	for (var i = 0; i < data.length; i++) {
		var data_item = data[i];
		var data_group = data_item.group;
		if (!(data_group in organized_data)) organized_data[data_group] = [];
		organized_data[data_group].push(data_item);
	}

	// render
	$('.lists').children().remove();
	for (var group_name in organized_data) {
		var list_el = $(list_el_tpl.replace(/\{group_name\}/g, group_name));
		list_el.data('group_name', group_name);
		var group_items = organized_data[group_name];
		for (var i = 0; i < group_items.length; i++) {
			var group_item = group_items[i];
			var item_el = $(list_item_el_tpl
				.replace(/\{name\}/g, group_item.name)
				.replace(/\{link\}/g, group_item.link)
				.replace(/\{titles\}/g, group_item.titles.join('、')));
			item_el.data('item', group_item);
			if (group_item.emails.length == 0) $('<li><span>暂无</span></li>').appendTo(item_el.find('.email .value ul'));
			else for (var j = 0; j < group_item.emails.length; j++) {
				var email_addr = group_item.emails[j];
				$('<li><a href="' + email_addr + '">' + email_addr + '</a></li>').appendTo(item_el.find('.email .value ul'));
			}
			if (group_item.interests.length == 0) $('<li><span>暂无</span></li>').appendTo(item_el.find('.interest .value ul'));
			else for (var j = 0; j < group_item.interests.length; j++) {
				var interest = group_item.interests[j];
				$('<li><span>' + interest + '</span></li>').appendTo(item_el.find('.interest .value ul'));
			}
			item_el.appendTo(list_el.find('.list-list'));
		}
		list_el.appendTo('.lists');
	}
}

function getFilter() {
	return {
		career: parseInt($('#filter-career').val()),
		area: parseInt($('#filter-area').val())
	};
}
function validateItem(item, filter) {
	if (!item.active) return false;

	var validate_results = {
		career: false,
		area: false
	};

	// career
	if (item.titles.indexOf('首席研究员') >= 0) validate_results.career = true;
	else if ((item.titles.indexOf('研究员') >= 0) && (filter.career >= 1)) validate_results.career = true;
	else if ((item.titles.indexOf('副研究员') >= 0) && (filter.career >= 2)) validate_results.career = true;

	// area
	if (!(item.group in app_data.area)) validate_results.area = false;
	else if (filter.area == 2) validate_results.area = true;
	else if ((filter.area == 0) && (app_data.area[item.group] == "北京")) validate_results.area = true;
	else if ((filter.area == 1) && (app_data.area[item.group] != "北京")) validate_results.area = true;

	// conclusion
	for (var k in validate_results) 
		if (!(validate_results[k])) return false;
	return true;
}
function do_filter() {
	var filter = getFilter();

	$('.lists .list').each(function(index, el) {
		var valid = false;
		var group_name = $(this).data('group_name');
		if (!(group_name in app_data.area)) valid = false;
		else if (filter.area == 2) valid = true;
		else if ((filter.area == 0) && (app_data.area[group_name] == "北京")) valid = true;
		else if ((filter.area == 1) && (app_data.area[group_name] != "北京")) valid = true;
		if (valid) $(this).removeClass('hidden');
		else $(this).addClass('hidden');
	});
	$('.lists .item').each(function(index, el) {
		var data_item = $(this).data('item');
		var valid = validateItem(data_item, filter);
		if (valid) $(this).removeClass('hidden');
		else $(this).addClass('hidden');
	});
}

$(document).ready(function() {
	$.ajax({
		url: 'raw.txt'
	})
	.done(function(data) {
		try {
			app_data.data = parseRaw(data);
		} catch (e) {
			console.error(e);
			dataError();
		}
		if (app_data.data && app_data.area) {
			inflateData(app_data.data, app_data.area);
			do_filter();
		}
	})
	.fail(function(e) {
		console.error(e);
		dataError();
	});
	$.ajax({
		url: 'area.txt'
	})
	.done(function(data) {
		try {
			app_data.area = parseArea(data);
		} catch (e) {
			console.error(e);
			dataError();
		}
		if (app_data.data && app_data.area) {
			inflateData(app_data.data, app_data.area);
			do_filter();
		}
	})
	.fail(function(e) {
		console.error(e);
		dataError();
	});
});

$('.header select').change(function(event) {
	do_filter();
});

$('.lists')
.on('click', '.list-title', function(event) {
	event.preventDefault();
	var list_el = $(this).closest('.list');
	if (list_el.is('.collapsed')) {
		list_el.removeClass('collapsed');
	} else {
		list_el.addClass('collapsed');
	}
});