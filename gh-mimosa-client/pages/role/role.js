/**
 * 角色管理
 */
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'role',
			init: function() {
				var confirm = $('#confirmModal')
					// 缓存选取的权限
				var chosenAuths = []
					// 分页配置
				var pageOptions = {
						number: 1,
						size: 10,
						offset: 0,
						name: ''
					}
					// 权限表格配置
				var tableConfig = {
						ajax: function(origin) {
							http.post(config.api.role.list, {
								data: {
									page: pageOptions.number,
									rows: pageOptions.size,
									name: pageOptions.name,
									stats: true,
									system: config.system
								},
								contentType: 'form'
							}, function(rlt) {
								origin.success(rlt)
							})
						},
						pageSize: pageOptions.size,
						pagination: true,
						sidePagination: 'server',
						pageList: [10, 20, 30, 50, 100],
						queryParams: getQueryParams,
/*						onClickCell: function (field, value, row, $element) {
							switch (field) {
								case 'name':
									qryInfo(value,row)
									break
							}
						},*/
						columns: [{
							width: 30,
							align: 'center',
							formatter: function(val, row, index) {
								return pageOptions.offset + index + 1
							}
						}, {
							field: 'name',
							/*class:"table_title_detail"*/
						}, {
							align: 'right',
							field: 'rac'
						}, {
							align: 'right',
							field: 'arc'
						}, {
							align: 'right',
							field: 'updateTime'
						}, {
							align: 'right',
							field: 'createTime'
						}, {
							width: 180,
							align: 'center',
							formatter: function() {
								
								
								
								var format = ''
								format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
	            				+'<span style=" margin:auto 0px auto 10px;cursor: pointer;width: 35px;" class="fa fa-trash-o item-delete"></span>';
								return format;
							},
							events: {
								'click .item-update': function(e, val, row) {
									var form = document.updateRoleForm
										// 重置和初始化表单验证
									$(form).validator('destroy')
									util.form.validator.init($(form));
									form.oid.value = row.oid
									form.name.value = row.name
									$('#updateRoleModal').modal('show')
								},
								'click .item-delete': function(e, val, row) {
									$$.confirm({
										container: $('#confirmModal'),
										trigger: this,
										accept: function() {
											http.post(config.api.role.delete, {
												data: {
													oid: row.oid
												},
												contentType: 'form'
											}, function() {
												$('#roleTable').bootstrapTable('refresh')
											})
										}
									})
								}
							}
						}]
					}
					// 初始化权限表格
				$('#roleTable').bootstrapTable(tableConfig)
					// 初始化权限表格搜索表单
				$$.searchInit($('#searchForm'), $('#roleTable'))

				// 初始化新建角色表单验证
				util.form.validator.init($('#addRoleForm'))

				// 新建角色按钮点击事件
				$('#addRole').on('click', function() {
					$('#addRoleModal').modal('show')
				})

				// 新建角色 - 确定按钮点击事件
				$('#doAddRole').on('click', function() {
					var form = document.addRoleForm
					if (!$(form).validator('doSubmitCheck')) return
					form.systemOid.value = config.system
					chosenAuths.forEach(function(item) {
						$(form).append('<input name="auths" type="hidden" value="' + item.oid + '">')
					})
					$(form).ajaxSubmit({
						url: config.api.role.save,
						success: function(result) {
							if(result.errorCode == 0){
								$(form).find('input[name=auths]').remove()
								util.form.reset($(form))
								$('#roleTable').bootstrapTable('refresh')
								$('#addRoleModal').modal('hide')
							}else{
								errorHandle(result);
							}
						}
					})
				})

				// 修改角色 - 确定按钮点击事件
				$('#doUpdateRole').on('click', function() {
					var form = document.updateRoleForm
					if (!$(form).validator('doSubmitCheck')) return
					form.systemOid.value = config.system
					chosenAuths.forEach(function(item) {
						$(form).append('<input name="auths" type="hidden" value="' + item.oid + '">')
					})
					$(form).ajaxSubmit({
						url: config.api.role.update,
						success: function(result) {
							if(result.errorCode == 0){
								$(form).find('input[name=auths]').remove()
								util.form.reset($(form))
								$('#roleTable').bootstrapTable('refresh')
								$('#updateRoleModal').modal('hide')
							}else{
								errorHandle(result);
							}
						}
					})
				})

				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
						// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.name = form.name.value.trim()
					return val
				}
				
/*				function qryInfo(value,row){
					$$.detailAutoFix($('#detailModal'), row);
					$('#detailModal').modal('show')
				}*/
			}
		}
	})
