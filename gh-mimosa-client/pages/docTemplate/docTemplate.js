/**
 * 凭证模板
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'docTemplate',
		init: function() {
			http.post(config.api.acct.doc.type.search, {
				data: {},
				contentType: 'form'
			}, function(val) {
				$.each(val, function(i, v) {
					$(document.searchForm.templateType).append('<option value="' + v.oid + '">' + v.name + '</option>')
				});
			});

			var queryParams = {
				templateType: '',
				templateName: '',
				page: 1,
				size: 10
			};

			$('#dataTable').bootstrapTable({
				classes: '',
				ajax: function(origin) {
					http.post(config.api.acct.doc.template.entry.search, {
						data: queryParams,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				queryParams: function(val) {
					var form = document.searchForm;
					queryParams.templateType = form.templateType.value.trim();
					queryParams.templateName = form.templateName.value.trim();
					queryParams.size = val.limit;
					queryParams.page = parseInt(val.offset / val.limit) + 1
				},
				pageNumber: queryParams.page,
				pageSize: queryParams.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				columns: [{
					field: 'typeName',
					formatter: function(val, row, index) {
						return row.master ? val : '';
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#F9F9F9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'templateName',
					formatter: function(val, row, index) {
						return row.master ? val : '';
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#F9F9F9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'entryDigest',
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#F9F9F9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'accountOid',
					formatter: function(val, row, index) {
						return val + '&nbsp;&nbsp;' + row.accountName;
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#F9F9F9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'entryDirection',
					formatter: function(val, row, index) {
						if (val == 'Dr') {
							return '借';
						} else if (val == 'Cr') {
							return '贷';
						} else if (val == 'Er') {
							return '平';
						} else {
							return '';
						}
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#F9F9F9' : '#FFFFFF'
							}
						}
					}
				}/*, {
					align: 'center',
					field: 'entryOid',
					formatter: function(val, row, index) {

						var updateButton = {
							text: '修改',
							type: 'button',
							class: 'item-update',
							isRender: true
						};

						var buttons = [updateButton];
						return row.master ? util.table.formatter.generateButton(buttons) : 'dataTable';
					},
					events: {
						'click .item-update': function(e, value, row) {}
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#F9F9F9' : '#FFFFFF'
							}
						}
					}
				}*/],
				onLoadSuccess: function(data) {
					$.each(data.rows, function(i, item) {
						if (item.master) {
							$('#dataTable').bootstrapTable('mergeCells', {
								index: i,
								field: 'typeName',
								colspan: 1,
								rowspan: item.rowspan
							});
							$('#dataTable').bootstrapTable('mergeCells', {
								index: i,
								field: 'templateName',
								colspan: 1,
								rowspan: item.rowspan
							});
							$('#dataTable').bootstrapTable('mergeCells', {
								index: i,
								field: 'entryOid',
								colspan: 1,
								rowspan: item.rowspan
							});
						}
					});
				}

			});

			$$.searchInit($('#searchForm'), $('#dataTable'));

			// $('#updateDocTemplateModal').modal('show')

		}
	}
})