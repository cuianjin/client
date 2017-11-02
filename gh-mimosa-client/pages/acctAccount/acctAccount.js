/**
 * 科目设置
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'acctAccount',
		init: function() {

			$('#dataTable').bootstrapTable({
				ajax: function(origin) {
					http.post(config.api.acct.account.search, {}, function(rlt) {
						origin.success(rlt)
					})
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return index + 1
					}
				}, {
					field: 'code',
					align:'right'
				}, {
					field: 'name',
					formatter: function(val, row, index) {
						if (row.code.length <= 4) {
							return val;
						} else {
							var x = row.code.length - 4;
							for (var i = 0; i < x; i++) {
								val = '&nbsp;&nbsp;&nbsp;&nbsp;' + val;
							}
							return val;
						}
					}
				}, {
					field: 'direction',
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
					}
				}, {
					field: 'type',
					formatter: function(val, row, index) {
						if (val == 'ASSETS') {
							return '资产';
						} else if (val == 'LIABILITY') {
							return '负债';
						} else if (val == 'EQUITY') {
							return '权益';
						} else {
							return '';
						}
					}
				}, {
					align: 'center',
					formatter: function(val, row, index) {

						var updateButton = {
							text: '修改',
							type: 'button',
							class: 'item-update',
							isRender: true
						};

						var buttons = [updateButton];

						return util.table.formatter.generateButton(buttons, 'dataTable');
					},
					events: {
						'click .item-update': function(e, value, row) {
							var form = document.updateForm
							$(form).validator('destroy')
							util.form.validator.init($(form));
							
							$('#updateModal').modal('show');
							$$.formAutoFix($('#updateForm'), row);
						}
					}
				}]

			});

			util.form.validator.init($('#updateForm'))
			
			$('#updateButton').on('click', function() {
				if (!$('#updateForm').validator('doSubmitCheck')) return
				
				$('#updateForm').ajaxSubmit({
					url: config.api.acct.account.update,
					success: function(result) {
						$('#updateForm').clearForm();
						$('#updateModal').modal('hide');
						$('#dataTable').bootstrapTable('refresh');
					}
				})
			});
		}
	}
})