/**
 * 费金提取
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'chargeFee',
		init: function() {
			// 分页配置
			var pageOptions = {
				name: "",
				page: 1,
				rows: 10
			}
			// 数据表格配置
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.duration.feigin.getAll, {
						data: pageOptions,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions.page,
				pageSize: pageOptions.rows,
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
					// 资产池名称
					field: 'assetPoolName'
				}, 
				{ 
					// 费金
					field: 'chargeFee',
					align: 'right'
				}, 
				{ 
					// 摘要
					field: 'digest'
				}, 
				{ 
					// 计提人
					field: 'creator'
				}, 
				{ 
					// 计提时间
					field: 'createTime',
					align: 'right'
				}, 
				{ 
					// 提取人
					field: 'drawer'
				}, 
				{ 
					// 提取时间
					field: 'drawTime',
					align: 'right'
				},  
				{ 
					// 状态
					field: 'state',
					formatter: function(val) {
						var className = ''
						var str = ''
						switch (parseInt(val)) {
							case 0:
								className = 'text-red'
								str = '未提取'
								break
							case 1:
								className = 'text-green'
								str = '已提取'
								break
						}
						return '<span class="' + className + '">' + str + '</span>'
					}
				}, 
				{
					width: 200,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '提取',
							type: 'button',
							class: 'item-draw',
							isRender: parseInt(row.state) === 0
						}]
						return util.table.formatter.generateButton(buttons, 'chargeFeeTable')
					},
					events: {
						'click .item-draw': function(e, val, row) {
							$$.confirm({
								container: $('#calcConfirmModal'),
								trigger: this,
								accept: function () {
									http.post(config.api.duration.feigin.updateByOid, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(json) {
										$('#chargeFeeTable').bootstrapTable('refresh')
									})
								}
							})
						}
					}
				}]
			}

			// 初始化数据表格
			$('#chargeFeeTable').bootstrapTable(tableConfig);
			// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#chargeFeeTable'));

			// 新增费金计提按钮点击事件
			$('#chargeFeeApply').on('click', function() {
				http.post(config.api.duration.assetPool.getNameList, {
					contentType: 'form'
				}, function(json) {
					var result = json.rows
					var assetPoolOptions = ''
					if (result) {
						result.forEach(function(item) {
							assetPoolOptions += '<option value="' + item.oid + '">' + item.name + '</option>'
						})
						$('#assetPoolList').html(assetPoolOptions)
					}
				})
				$('#addChargeFeeModal').modal('show')
			})
			// 新增费金计提表单验证初始化
			$('#addChargeFeeForm').validator({
				custom: {
					validfloat: util.form.validator.validfloat,
					validint: util.form.validator.validint,
				},
				errors: {
					validfloat: '数据格式不正确',
					validint: '数据格式不正确',
				}
			})
			// 新增费金计提 - 确定按钮点击事件
			$('#doAddChargeFee').on('click', function() {
				if (!$('#addChargeFeeForm').validator('doSubmitCheck')) return
				$('#addChargeFeeForm').ajaxSubmit({
					url: config.api.duration.feigin.create,
					success: function() {
						util.form.reset($('#addChargeFeeForm'))
						$('#chargeFeeTable').bootstrapTable('refresh');
						$('#addChargeFeeModal').modal('hide')
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
