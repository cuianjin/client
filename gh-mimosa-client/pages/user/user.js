/**
 * 用户管理
 */
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'user',
			init: function() {
				var confirm = $('#confirmModal')

				// 缓存全部角色信息
				var roles = []
				http.post(config.api.role.list, {
					data: {

						system: config.system,
					},
					contentType: 'form'
				}, function(res) {
					roles = res.rows
					var addRoles = document.addUserForm.roles
					var updateRoles = document.updateUserForm.roles
					roles.forEach(function(item) {
						$(addRoles).append('<option value="' + item.oid + '">' + item.name + '</option>')
						$(updateRoles).append('<option value="' + item.oid + '">' + item.name + '</option>')
					})
					$(addRoles).select2()
					$(updateRoles).select2()
				})

				// 分页配置
				var pageOptions = {
						page: 1,
						rows: 10,
						offset: 0,
						keyword: '',
						type: 'ADMIN',
						system: config.system
					}
					// 权限表格配置
				var tableConfig = {
						ajax: function(origin) {
							http.post(config.api.user.search, {
								data: pageOptions,
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
						onClickCell: function (field, value, row, $element) {
						  switch (field) {
				        	case 'account':
					        	queryInfo(value,row)
					        	break
						  }
						},
						columns: [{
							width: 30,
							align: 'center',
							formatter: function(val, row, index) {
								return pageOptions.offset + index + 1
							}
						}, 
//						{
//							field: 'sn'
//						}, 
						{
							class: 'item-detail table_title_detail',
							field: 'account',

						}, {
							field: 'name'
						}, {
							field: 'comment'
						}, {
							field: 'status',
							formatter: function(val) {
								switch (val) {
									case 'VALID':
										return '<span class="text-green">正常</span>'
									case 'EXPIRED':
										return '<span class="text-yellow">过期</span>'
									case 'FREEZE':
										return '<span class="text-red">冻结</span>'
								}
							}
						}, {
							align: 'right',
							field: 'validDate'
						}, {
							align: 'right',
							field: 'loginIp'
						}, {
							align: 'right',
							field: 'loginTime'
						}, {
							align: 'center',
							formatter: function(val, row, index) {
								var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#userTable').bootstrapTable('getData').length - 1,
									sub:[ 
										 {
											text: '冻结',
											type: 'button',
											class: 'item-freeze',
											isRender: row.status !== 'EXPIRED' && row.status !== 'FREEZE'
										}, {
											text: '解冻',
											type: 'button',
											class: 'item-unfreeze',
											isRender: row.status === 'FREEZE'
										}, {
											text: '重设密码',
											type: 'button',
											class: 'item-genpwd',
											isRender: true
										}]
								}]
								var format = util.table.formatter.generateButton(buttons, 'userTable');
								format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
								return format;
							},
							events: {

								'click .item-update': function(e, val, row) {
									var form = document.updateUserForm
										// 重置和初始化表单验证
									$(form).validator('destroy')
									util.form.validator.init($(form));

									$$.formAutoFix($(form), row)
									if (!row.validTime) {
										$(form.validSign).val('').trigger('change')
									} else {
										$(form.validSign).val('1').trigger('change')
									}
									// 角色select2赋值
									http.post(config.api.user.roles, {
										data: {
											adminOid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										$(form.roles).val(result.rows.map(function(item) {
											return item.oid
										})).trigger('change')
									})

									$('#updateUserModal').modal('show')
								},
								'click .item-freeze': function(e, val, row) {
									confirm.find('.confirmTitle').text('确定冻结此用户？')
									$$.confirm({
										container: confirm,
										trigger: this,//.parentNode.parentNode.parentNode
										accept: function() {
											http.post(config.api.user.freeze, {
												data: {
													oid: row.oid
												},
												contentType: 'form'
											}, function() {
												$('#userTable').bootstrapTable('refresh')
												
												updateAdmins()
											})
										}
									})
								},
								'click .item-unfreeze': function(e, val, row) {
									confirm.find('.confirmTitle').text('确定解冻此用户？')
									$$.confirm({
										container: confirm,
										trigger: this,//.parentNode.parentNode.parentNode
										accept: function() {
											http.post(config.api.user.unfreeze, {
												data: {
													oid: row.oid
												},
												contentType: 'form'
											}, function() {
												$('#userTable').bootstrapTable('refresh')
												
												updateAdmins()
											})
										}
									})
								},
								'click .item-genpwd': function(e, val, row) {
									confirm.find('.confirmTitle').text('确定重设 [' + row.name + '] 用户密码？')
									$$.confirm({
										container: confirm,
										trigger: this,//.parentNode.parentNode.parentNode
										accept: function() {
											http.post(config.api.genPwd, {
												data: {
													adminOid: row.oid
												},
												contentType: 'form'
											}, function(rlt) {
												$('#newpwd').val(rlt.password)
												$('#genpwdAccount').html(row.account)
												$('#genpwdModal').modal('show')
											})
										}
									})
								}
							}
						}]
					}
					// 初始化权限表格
				$('#userTable').bootstrapTable(tableConfig)
					// 初始化权限表格搜索表单
				$$.searchInit($('#searchForm'), $('#userTable'))

				// 新建/修改用户 - 有效期下拉菜单change事件
				$(document.addUserForm.validSign).on('change', function() {
					var form = $('#addUserForm')
					var nextCol = $(this).parent().parent().next('.col-sm-6')
					if (this.value) {
						nextCol.find('input[name=validTime]').attr('disabled', false)
						form.validator('destroy')
						util.form.validator.init(form)
						nextCol.show()
					} else {
						nextCol.find('input[name=validTime]').attr('disabled', 'disabled')
						form.validator('destroy')
						util.form.validator.init(form)
						nextCol.hide()
					}
				}).change()

				$(document.updateUserForm.validSign).on('change', function() {
					var form = $('#updateUserForm')
					var nextCol = $(this).parent().parent().next('.col-sm-6')
					if (this.value) {
						nextCol.find('input[name=validTime]').attr('disabled', false)
						form.validator('destroy')
						util.form.validator.init(form)
						nextCol.show()
					} else {
						nextCol.find('input[name=validTime]').attr('disabled', 'disabled')
						form.validator('destroy')
						util.form.validator.init(form)
						nextCol.hide()
					}
				})

				// 新建用户按钮点击事件
				$('#addUser').on('click', function() {
					var form = $('#addUserForm')
					form.validator('destroy')
					util.form.validator.init(form)
					$('#addUserModal').modal('show')
				})

				// 新建用户 - 确定按钮点击事件
				$('#doAddUser').on('click', function() {
					var form = document.addUserForm
					form.system.value = config.system
					if (!$(form).validator('doSubmitCheck')) return
					$(form).ajaxSubmit({
						url: config.api.user.create,
						success: function(result) {
							if(result.errorCode == 0){
								util.form.reset($(form))
								$('#userTable').bootstrapTable('refresh')
								$('#addUserModal').modal('hide')
								
								updateAdmins()
							}else{
								errorHandle(result);
							}
						}
					})
				})

				// 修改用户 - 确定按钮点击事件
				$('#doUpdateUser').on('click', function() {
					var form = document.updateUserForm
					if (!$(form).validator('doSubmitCheck')) return
					$(form).ajaxSubmit({
						url: config.api.user.update,
						success: function(result) {
							if(result.errorCode == 0){
								util.form.reset($(form))
								$('#userTable').bootstrapTable('refresh')
								$('#updateUserModal').modal('hide')
								
								updateAdmins()
							}else{
								errorHandle(result);
							}
						}
					})
				})
				
				/*
				$('#newpwdCopy').on('click', function() {
					var pwd = $('#newpwd').val();
					copy(pwd);
					var copied = util.copyToClipboard(pwd);
					if (copied) {
						$(this).html('<span style="color: greenyellow;">复制成功</span>')
					} else {
						alert('复制失败!')
					}
				})
				*/
				
				$('#newpwdCopyClose').on('click', function() {
					$('#genpwdModal').modal('hide')
				})

				function getQueryParams(val) {
					// 参数 val 是bootstrap-table默认的与服务器交互的数据，包含分页、排序数据
					var form = document.searchForm
						// 分页数据赋值
					pageOptions.rows = val.limit
					pageOptions.page = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.keyword = form.keyword.value.trim()
					return val
				}
				function queryInfo(value,row){
					
							
					console.log(row)
					http.post(config.api.user.roles, {
						data: {
							adminOid: row.oid
						},
						contentType: 'form'
					}, function(result) {
						row.roleStr = result.rows.map(function(item) {
							return '<span style="margin-right: 10px;">' + item.name + '</span>'
						}).join('')
						row.validTimeStr = row.validTime || '永久性'
						$$.detailAutoFix($('#detailModal'), row)
					})
					$('#detailModal').modal('show')
								
					
					
					
				}
				
				// 更新管理员信息
				function updateAdmins () {
					http.post(config.api.adminSearch, {
		            	data: {
		            		system: config.system,
		            		rows: 10000,
		            		page: 1
		            	},
		                 contentType: 'form'
		            }, function (enums) {
		            	var ADMINLIST = [], ADMINACCLIST = [];
		            	var lista = '', listb = '';
		            	enums.rows.forEach(function(row){
		            		ADMINLIST.push({
		            			id: row.oid,
		            			text: row.name
		            		})
		            	})
		            	//过滤管理员列表
		            	http.post(config.api.allacc, {
			                 contentType: 'form'
			            }, function (rlt) {
			            	rlt.allAcc.forEach(function(acc){
			            		lista += acc
			            	})
			            	ADMINLIST.forEach(function(admin){
			            		if(!lista.match(admin.id)){
			            			listb += admin.id+','
			            		}
			            	})
			            	listb = listb.substr(0,listb.lastIndexOf(',')).split(',')
			            	listb.forEach(function(list){
			            		ADMINLIST.forEach(function(admin){
			            			if (list === admin.id) {
			            				ADMINACCLIST.push(admin)
			            			}
			            		})
			            	})
			            	config["ADMINLIST"] = ADMINLIST
			            	config["ADMINACCLIST"] = ADMINACCLIST
		                	$$.enumSourceInit($(document))
			            });
		            });
				}
			}
		}
	})