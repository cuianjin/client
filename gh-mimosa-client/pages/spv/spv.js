/**
 * SPV管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'spv',
		init: function() {
			// 数据表格分页、搜索条件配置
			var pageOptions = {
				page: 1,
				rows: 10,
				name: '',
				companyName: '',
				website: '',
				address: '',
				contact: '',
				telephone: '',
				email: ''
			}
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.spv.getAll, {
						data: pageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions.number,
				pageSize: pageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams,
				onLoadSuccess: function() {},
				columns: [{
					width: 60,
					align: 'center',
					formatter: function(val, row, index) {
						return (pageOptions.page - 1) * pageOptions.rows + index + 1
					}
				}, 
				{
					field: 'name'
				}, 
				{
					field: 'companyName'
				}, 
				{
					field: 'accountType',
					formatter: function(val) {
						if (val == 'UPSPLAT') {
							return '虚拟账户'
						} else if (val == 'BNKCARD') {
							return '银行结算账户'
						} else {
							return '--'
						}
					}
				}, 
				{
					field: 'accountNo'
				}, 
				{
					field: 'website'
				}, 
				{
					field: 'address'
				}, 
				{
					field: 'contact'
				}, 
				{
					field: 'telephone'
				}, 
				{
					field: 'email'
				}, 
				{
					field: 'status',
					formatter: function(val) {
						if (val === 'normal') {
							return '正常'
						} else {
							return '禁用'
						}
					}
				},
				{
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '详情',
							type: 'button',
							class: 'item-detail',
						}, {
							text: '编辑',
							type: 'button',
							class: 'item-edit',
						}, {
							text: '锁定',
							type: 'button',
							class: 'item-disabled',
							isRender: row.status === 'normal'
						}, {
							text: '解锁',
							type: 'button',
							class: 'item-normal',
							isRender: row.status === 'disabled'
						}];
						return util.table.formatter.generateButton(buttons, 'spvTable');
					},
					events: {
						'click .item-detail': function(e, val, row) {
							var modal = $('#detailModal')
							http.post(config.api.duration.spv.getByOid, {
								data: {
									oid: row.oid,
								},
								contentType: 'form'
							}, function(json) {
								var result = json.result
								if (result.accountType == 'UPSPLAT') {
									result.accountType = '虚拟账户'
								}
								else if (result.accountType == 'BNKCARD') {
									result.accountType = '银行结算账户'
								} else {
									result.accountType = '--'
								}
								if (result.status === 'normal') {
									result.status = '正常'
								} else {
									result.status = '锁定'
								}
								$$.detailAutoFix(modal, result)
							})
							modal.modal('show')
						},
						'click .item-edit': function(e, val, row) {
							var modal = $('#editSPVModal')
							http.post(config.api.duration.spv.getByOid, {
								data: {
									oid: row.oid,
								},
								contentType: 'form'
							}, function(json) {
								var result = json.result
								document.editSPVForm.accountType = result.accountType
								$$.formAutoFix($('#editSPVForm'), result)
							})
							modal.modal('show')
						},
						'click .item-disabled': function(e, val, row) {
							$$.confirm({
								container: $('#doConfirmModal'),
								trigger: this,
								accept: function () {
									http.post(config.api.duration.spv.update, {
										data: {
											oid: row.oid,
											operation: 'disabled'
										},
										contentType: 'form'
									}, function(json) {
										$('#spvTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-normal': function(e, val, row) {
							$$.confirm({
								container: $('#doConfirmModal'),
								trigger: this,
								accept: function () {
									http.post(config.api.duration.spv.update, {
										data: {
											oid: row.oid,
											operation: 'normal'
										},
										contentType: 'form'
									}, function(json) {
										$('#spvTable').bootstrapTable('refresh')
									})
								}
							})
						}

					}
				}]
			}

			// 数据表格初始化
			$('#spvTable').bootstrapTable(tableConfig)
			// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#spvTable'))
			// 新增SPV表单验证初始化
			util.form.validator.init($('#addSPVForm'))
			// 编辑SPV表单验证初始化
			util.form.validator.init($('#editSPVForm'))

			// 新建SPV按钮点击事件
			$('#spvAdd').on('click', function() {
				util.form.reset($('#addSPVForm'))
				$('#addSPVModal').modal('show')
			})

			// 新建SPV - 按钮点击事件
			$('#addSPVSubmit').on('click', function() {
				if (!$('#addSPVForm').validator('doSubmitCheck')) return
				$('#addSPVForm').ajaxSubmit({
					url: config.api.duration.spv.create,
					success: function(addResult) {
						util.form.reset($('#addSPVForm'))
						$('#addSPVModal').modal('hide')
						$('#spvTable').bootstrapTable('refresh')
					}
				})
			})

			// 编辑SPV - 按钮点击事件
			$('#editSPVSubmit').on('click', function() {
				if (!$('#editSPVForm').validator('doSubmitCheck')) return
				$('#editSPVForm').ajaxSubmit({
					url: config.api.duration.spv.edit,
					success: function(addResult) {
						util.form.reset($('#editSPVForm'))
						$('#editSPVModal').modal('hide')
						$('#spvTable').bootstrapTable('refresh')
					}
				})
			})

			function getQueryParams(val) {
				var form = document.searchForm
				$.extend(pageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象
				pageOptions.rows = val.limit
				pageOptions.page = parseInt(val.offset / val.limit) + 1
				return val
			}
		}
	}
})