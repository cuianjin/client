/**
 * 通道产品运营设置
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'labelManagement',
		init: function() {

			/**
			 * 基础标签数据表格分页、搜索条件配置
			 */
			var basicProductLabelPageOptions = {
				labelType: 'general',
				number: 1,
				size: 10
			}

			/**
			 * 基础标签表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			 * @param {Object} val
			 */
			function getBasicProductLabelQueryParams(val) {
				basicProductLabelPageOptions.labelType = 'general'
				basicProductLabelPageOptions.size = val.limit
				basicProductLabelPageOptions.number = parseInt(val.offset / val.limit) + 1
				return val
			}

			/**
			 * 基础标签数据表格配置
			 */
			var basicProductLabelTableConfig = {
				ajax: function(origin) {
					http.post(
						config.api.system.productLabel.productLabelList, {
							data: {
								labelType: basicProductLabelPageOptions.labelType,
								page: basicProductLabelPageOptions.number,
								rows: basicProductLabelPageOptions.size
							},
							contentType: 'form'
						},
						function(rlt) {
							origin.success(rlt)
						}
					)
				},
				pageNumber: basicProductLabelPageOptions.number,
				pageSize: basicProductLabelPageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getBasicProductLabelQueryParams,
				onLoadSuccess: function() {},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return(basicProductLabelPageOptions.number - 1) * basicProductLabelPageOptions.size + index + 1
					}
				}, {
					/*align: 'right',*/
					field: 'labelCode',
					align:'right'
				}, {
					field: 'labelName',
				}, {
					field: 'labelDesc',
				}, {
					field: 'isOk',
					formatter: function(val, row, index) {
						switch(val) {
							case 'yes':
								return '已开启'
							case 'no':
								return '已停用'
							default:
								return '-'
						}
					}
				}, {
					width: 256,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '停用',
							type: 'button',
							class: 'item-invalid',
							isRender: row.isOk == 'yes'
						}, {
							text: '开启',
							type: 'button',
							class: 'item-valid',
							isRender: row.isOk == 'no'
						}];
						var format = util.table.formatter.generateButton(buttons, 'basicProductLabelTable')
		            	format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
		            	return format
					},
					events: {
						'click .item-invalid': function(e, value, row) {
							$("#confirmTitle").html(row.labelName)
							$("#confirmTitle1").html("确认停用吗？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.system.productLabel.invalid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#basicProductLabelTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-valid': function(e, value, row) {
							$("#confirmTitle").html(row.labelName)
							$("#confirmTitle1").html("确认启用吗？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.system.productLabel.valid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#basicProductLabelTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-update': function(e, value, row) {
							$('#updateProductLabelForm').validator('destroy')
							http.post(config.api.system.productLabel.detail, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								var data = result;
								$(document.updateProductLabelForm.labelCode).attr("data-fetch-id", data.oid)
								$$.formAutoFix($('#updateProductLabelForm'), data); // 自动填充表单
								util.form.validator.init($('#updateProductLabelForm'))

								$('#updateProductLabelTitle').html('编辑基础标签')

								$('#updateProductLabelModal').modal('show');
							})
						}
					}
				}]
			}

			/**
			 * 基础标签数据表格初始化
			 */
			$('#basicProductLabelTable').bootstrapTable(basicProductLabelTableConfig)

			/**
			 * 新建基础标签按钮点击事件
			 */
			$('#addBasicProductLabel').on('click', function() {

				$("#labelType").val('general')
				$('#addProductLabelTitle').html('新建基础标签')

				var form = document.addProductLabelForm

				$(form).validator('destroy')
				util.form.validator.init($(form));

				util.form.reset($('#addProductLabelForm'))
				$('#addProductLabelModal').modal('show')
			})

			/**
			 * 新建“保存”按钮点击事件
			 */
			$('#addProductLabelSubmit').on('click', function() {
				if(!$('#addProductLabelForm').validator('doSubmitCheck')) return

				$('#addProductLabelForm').ajaxSubmit({
					url: config.api.system.productLabel.save,
					success: function(addResult) {
						if(addResult.errorCode == 0) {
							util.form.reset($('#addProductLabelForm'))
							$('#addProductLabelModal').modal('hide')
							$('#basicProductLabelTable').bootstrapTable('refresh')
							$('#expandProductLabelTable').bootstrapTable('refresh')
						} else {
							alert(addResult.errorMessage)
						}
					}
				})
			})

			/**
			 * 编辑“保存”按钮点击事件
			 */
			$('#updateProductLabelSubmit').on('click', function() {
				if(!$('#updateProductLabelForm').validator('doSubmitCheck')) return

				$('#updateProductLabelForm').ajaxSubmit({
					url: config.api.system.productLabel.update,
					success: function(addResult) {
						$('#updateProductLabelModal').modal('hide')
						$('#basicProductLabelTable').bootstrapTable('refresh')
						$('#expandProductLabelTable').bootstrapTable('refresh')
					}
				})
			})
			
			/**
			 * 扩展标签数据表格分页、搜索条件配置
			 */
			var expandProductLabelPageOptions = {
				labelType: 'extend',
				number: 1,
				size: 10
			}

			/**
			 * 扩展标签表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			 * @param {Object} val
			 */
			function getExpandProductLabelQueryParams(val) {
				expandProductLabelPageOptions.labelType = 'extend'
				expandProductLabelPageOptions.size = val.limit
				expandProductLabelPageOptions.number = parseInt(val.offset / val.limit) + 1
				return val
			}

			/**
			 * 扩展标签数据表格配置
			 */
			var expandProductLabelTableConfig = {
				ajax: function(origin) {
					http.post(
						config.api.system.productLabel.productLabelList, {
							data: {
								labelType: expandProductLabelPageOptions.labelType,
								page: expandProductLabelPageOptions.number,
								rows: expandProductLabelPageOptions.size
							},
							contentType: 'form'
						},
						function(rlt) {
							origin.success(rlt)
						}
					)
				},
				pageNumber: expandProductLabelPageOptions.number,
				pageSize: expandProductLabelPageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getExpandProductLabelQueryParams,
				onLoadSuccess: function() {},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return(expandProductLabelPageOptions.number - 1) * expandProductLabelPageOptions.size + index + 1
					}
				}, {
					field: 'labelCode',
				}, {
					field: 'labelName',
				}, {
					field: 'labelDesc',
				}, {
					field: 'isOk',
					formatter: function(val, row, index) {
						switch(val) {
							case 'yes':
								return '已开启'
							case 'no':
								return '已停用'
							default:
								return '-'
						}
					}
				}, {
					width: 256,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '停用',
							type: 'button',
							class: 'item-invalid',
							isRender: row.isOk == 'yes'
						}, {
							text: '开启',
							type: 'button',
							class: 'item-valid',
							isRender: row.isOk == 'no'
						}];
						var format = util.table.formatter.generateButton(buttons, 'expandProductLabelTable')
		            	format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
		            	return format
					},
					events: {
						'click .item-invalid': function(e, value, row) {
							$("#confirmTitle").html(row.labelName)
							$("#confirmTitle1").html("确认停用吗？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.system.productLabel.invalid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#expandProductLabelTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-valid': function(e, value, row) {
							$("#confirmTitle").html(row.labelName)
							$("#confirmTitle1").html("确认启用吗？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.system.productLabel.valid, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#expandProductLabelTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-update': function(e, value, row) {
							$('#updateProductLabelForm').validator('destroy')
							http.post(config.api.system.productLabel.detail, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								var data = result;
								$(document.updateProductLabelForm.labelCode).attr("data-fetch-id", data.oid)
								$$.formAutoFix($('#updateProductLabelForm'), data); // 自动填充表单
								util.form.validator.init($('#updateProductLabelForm'))

								$('#updateProductLabelTitle').html('编辑扩展标签')

								$('#updateProductLabelModal').modal('show');
							})
						}
					}
				}]
			}

			/**
			 * 扩展标签数据表格初始化
			 */
			$('#expandProductLabelTable').bootstrapTable(expandProductLabelTableConfig)

			/**
			 * 新建扩展标签按钮点击事件
			 */
			$('#addExpandProductLabel').on('click', function() {

				$("#labelType").val('extend')
				$('#addProductLabelTitle').html('新建扩展标签')

				var form = document.addProductLabelForm

				$(form).validator('destroy')
				util.form.validator.init($(form));

				util.form.reset($('#addProductLabelForm'))
				$('#addProductLabelModal').modal('show')
			})
			

		}

	}
})