
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'switchcraft',
			whiteInfo: {
				switchOid: ''
			},
			init: function() {
				var _this = this;
				_this.pagesInit();
				_this.bindEvent();
			},
			pagesInit: function() {
				var _this = this;
				
				var pageOptions = {
					number: 1,
					size: 10,
					offset: 0,
					code: '',
					name: '',
					status: '',
					whiteStatus: ''
				}
				var page2Options = {
					number: 1,
					size: 10,
					offset: 0,
					switchOid: '',
					userAcc: ''
				}
				
				var page3Options = {
					number: 1,
					size: 10,
					offset: 0,
					switchOid: '',
					userAcc: ''
				}
				
				var pageConfig = {
					ajax: function(origin) {
						http.post(util.buildQueryUrl(config.api.switchcraft.query, {
							page: pageOptions.number,
							rows: pageOptions.size,
							code: pageOptions.code,
							name: pageOptions.name,
							status: pageOptions.status,
							whiteStatus: pageOptions.whiteStatus
						}), function(rlt) {
							origin.success(rlt)
						})
					},
					idField: 'oid',
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getQueryParams,
					onClickCell: function (field, value, row, $element) {
					  	switch (field) {
			        		case 'name':toDetail(value,row)
					  	}
					},
					columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return pageOptions.offset + index + 1
						}
					}, {
						field: 'code',
					}, {
						field: 'name',
						class: 'table_title_detail'
					}, {
						field: 'type',
						formatter: function(val, row, index) {
							return util.enum.transform('switchTypes', val);
						}
					}, {
						field: 'content',
						formatter: function(val, row, index) {
							if (val.length > 50){
								return val.substring(0, 50)+"...";
							}
							return val;
						}
//					}, {
//						field: 'requester',
//						formatter: function(val, row, index) {
//							if (!val || val === undefined || val === ''){
//								return '--';
//							}
//							return val;
//						}
//					}, {
//						field: 'createTime',
//						formatter: function(val, row, index) {
//							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
//						}
//					}, {
//						field: 'updateTime',
//						formatter: function(val, row, index) {
//							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
//						}
//					}, {
//						field: 'approver',
//						formatter: function(val, row, index) {
//							if (!val || val === undefined || val === ''){
//								return '--';
//							}
//							return val;
//						}
					}, {
						field: 'whiteStatus',
						formatter: function(val, row, index) {
							return util.enum.transform('switchWhiteStatus', val);
						}
					}, {
						field: 'status',
						formatter: function(val, row, index) {
							return util.enum.transform('switchStatus', val);
						}
					}, {
						align: 'center',
						formatter: function(val, row, index) {
								var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#switchTable').bootstrapTable('getData').length - 1,
									sub:[{
					            		text: '启用',
					            		type: 'button',
					            		class: 'item-enable',
					            		isRender: row.status=='pass' || row.status=='disable'
					            	},{
					            		text: '禁用',
					            		type: 'button',
					            		class: 'item-disable',
					            		isRender: row.status=='pass' || row.status=='enable'
					            	},{
					            		text: '白名单启用',
					            		type: 'button',
					            		class: 'item-whiteEnable',
					            		isRender: row.status=='disable' && row.whiteStatus=='no'
					            	},{
					            		text: '白名单禁用',
					            		type: 'button',
					            		class: 'item-whiteDisable',
					            		isRender: row.status=='disable' && row.whiteStatus=='white'
					            	},{
					            		text: '黑名单启用',
					            		type: 'button',
					            		class: 'item-blackEnable',
					            		isRender: row.status=='enable' && row.whiteStatus=='no'
					            	},{
					            		text: '黑名单禁用',
					            		type: 'button',
					            		class: 'item-whiteDisable',
					            		isRender: row.status=='enable' && row.whiteStatus=='black'
					            	},{
					            		text: '审核',
					            		type: 'button',
					            		class: 'item-approve',
					            		isRender: row.status=='toApprove'
									}]
								}]
							var format = util.table.formatter.generateButton(buttons, 'switchTable');
							format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-edit"></span>'
							return format;
						},
						events: {
							'click .item-delete': toDelete,
							'click .item-edit': toEdit,
							'click .item-approve': toApprove,
							'click .item-enable': toEnable,
							'click .item-disable': toDisable,
							'click .item-blackEnable': toBlackEnable,
							'click .item-whiteEnable': toWhiteEnable,
							'click .item-whiteDisable': toWhiteDisable
						}
					}]
				}
				
				var page2Config = {
					ajax: function(origin) {
						http.post(util.buildQueryUrl(config.api.switchcraft.querywhite, {
							page: page2Options.number,
							rows: page2Options.size,
							switchOid: page2Options.switchOid,
							userAcc: page2Options.userAcc
						}), function(rlt) {
							origin.success(rlt)
						})
					},
					idField: 'oid',
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getWhiteQueryParams,
					columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return page2Options.offset + index + 1
						}
					}, {
						field: 'userAcc',
					}, {
						field: 'operator'
					}, {
						field: 'note'
					}, {
						field: 'createTime',
						formatter: function(val, row, index) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					}, {
						align: 'center',
						formatter: function(val, row, index) {
//							var buttons = [{
//								text: '删除',
//								type: 'button',
//								class: 'item-deletewhite',
//								isRender: row.status != 'toApprove'
//							}]
//							return util.table.formatter.generateButton(buttons, 'whiteTable');
							
							var format = ''
							if(row.status != 'toApprove'){
								format +='<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-deletewhite"></span>';
							}
							return format;
							
							
							
							
							
						},
						events: {
							'click .item-deletewhite': toDeleteWhite
						}
					}]
				}
				
				var page3Config = {
					ajax: function(origin) {
						http.post(util.buildQueryUrl(config.api.switchcraft.queryblack, {
							page: page3Options.number,
							rows: page3Options.size,
							switchOid: page3Options.switchOid,
							userAcc: page3Options.userAcc
						}), function(rlt) {
							origin.success(rlt)
						})
					},
					idField: 'oid',
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getBlackQueryParams,
					columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return page3Options.offset + index + 1
						}
					}, {
						field: 'userAcc',
					}, {
						field: 'operator'
					}, {
						field: 'note'
					}, {
						field: 'createTime',
						formatter: function(val, row, index) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					}, {
						align: 'center',
						formatter: function(val, row, index) {
//							var buttons = [{
//								text: '删除',
//								type: 'button',
//								class: 'item-deleteblack',
//								isRender: row.status != 'toApprove'
//							}]
//							return util.table.formatter.generateButton(buttons, 'blackTable');
							var format = ''
							if(row.status != 'toApprove'){
								format +='<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-deleteblack"></span>';
							}
							return format;
						},
						events: {
							'click .item-deleteblack': toDeleteBlack
						}
					}]
				}
				
				$('#switchTable').bootstrapTable(pageConfig);
				$('#whiteTable').bootstrapTable(page2Config);
				$('#blackTable').bootstrapTable(page3Config);
				$$.searchInit($('#searchForm'), $('#switchTable'));
				$$.searchInit($('#searchWhiteForm'), $('#whiteTable'));
				$$.searchInit($('#searchBlackForm'), $('#blackTable'));
				util.form.validator.init($('#addForm'));
				
				// 删除
				function toDeleteBlack(e, value, row) {
					$('#confirm_title').html('确定删除此条数据？');
					$$.confirm({
	                  	container: $('#confirm'),
	                  	trigger: this,
	                  	accept: function () {
	                    	http.post(config.api.switchcraft.delblack, {
	                      		data: {
	                        		oid: row.oid
	                      		},
	                      	contentType: 'form',
	                    	}, function (result) {
	                      		$('#blackTable').bootstrapTable('refresh')
	                    	})
	                  	}
	                })
				}
				
				// 删除
				function toDeleteWhite(e, value, row) {
					$('#confirm_title').html('确定删除此条数据？');
					$$.confirm({
	                  	container: $('#confirm'),
	                  	trigger: this,
	                  	accept: function () {
	                    	http.post(config.api.switchcraft.delwhite, {
	                      		data: {
	                        		oid: row.oid
	                      		},
	                      	contentType: 'form',
	                    	}, function (result) {
	                      		$('#whiteTable').bootstrapTable('refresh')
	                    	})
	                  	}
	                })
				}
				
				// 禁用黑白名单
				function toWhiteDisable(e, value, row) {
					$('#confirm_title').html('确定禁用？');
					$$.confirm({
	                  	container: $('#confirm'),
	                  	trigger: this,
	                  	accept: function () {
	                    	http.post(config.api.switchcraft.whitedisable, {
	                      		data: {
	                        		oid: row.oid
	                      		},
	                      	contentType: 'form',
	                    	}, function (result) {
	                      		$('#switchTable').bootstrapTable('refresh')
	                    	})
	                  	}
	                })
				}
				
				// 启用白名单
				function toWhiteEnable(e, value, row) {
					$('#confirm_title').html('确定启用白名单？');
					$$.confirm({
	                  	container: $('#confirm'),
	                  	trigger: this,
	                  	accept: function () {
	                    	http.post(config.api.switchcraft.whiteenable, {
	                      		data: {
	                        		oid: row.oid
	                      		},
	                      	contentType: 'form',
	                    	}, function (result) {
	                      		$('#switchTable').bootstrapTable('refresh')
	                    	})
	                  	}
	                })
				}
				// 启用黑名单
				function toBlackEnable(e, value, row) {
					$('#confirm_title').html('确定启用黑名单？');
					$$.confirm({
	                  	container: $('#confirm'),
	                  	trigger: this,
	                  	accept: function () {
	                    	http.post(config.api.switchcraft.blackenable, {
	                      		data: {
	                        		oid: row.oid
	                      		},
	                      	contentType: 'form',
	                    	}, function (result) {
	                      		$('#switchTable').bootstrapTable('refresh')
	                    	})
	                  	}
	                })
				}
				
				
				// 停用
				function toDisable(e, value, row) {
					$('#confirm_title').html('确定禁用？');
					$$.confirm({
	                  	container: $('#confirm'),
	                  	trigger: this,
	                  	accept: function () {
	                    	http.post(config.api.switchcraft.disable, {
	                      		data: {
	                        		oid: row.oid
	                      		},
	                      	contentType: 'form',
	                    	}, function (result) {
	                      		$('#switchTable').bootstrapTable('refresh')
	                    	})
	                  	}
	                })
				}
				
				// 启用
				function toEnable(e, value, row) {
					$('#confirm_title').html('确定启用？');
					$$.confirm({
	                  	container: $('#confirm'),
	                  	trigger: this,
	                  	accept: function () {
	                    	http.post(config.api.switchcraft.enable, {
	                      		data: {
	                        		oid: row.oid
	                      		},
	                      	contentType: 'form',
	                    	}, function (result) {
	                      		$('#switchTable').bootstrapTable('refresh')
	                    	})
	                  	}
	                })
				}
				
				// 删除
				function toDelete(e, value, row) {
					$('#confirm_title').html('确定删除此条数据？');
					$$.confirm({
	                  	container: $('#confirm'),
	                  	trigger: this,
	                  	accept: function () {
	                    	http.post(config.api.switchcraft.delete, {
	                      		data: {
	                        		oid: row.oid
	                      		},
	                      	contentType: 'form',
	                    	}, function (result) {
	                      		$('#switchTable').bootstrapTable('refresh')
	                    	})
	                  	}
	                })
				}
				
				// 修改
				function toEdit(e, value, row) {
					$$.formAutoFix($('#addForm'), row); // 自动填充详情      
					
					$('#addCode').attr('readonly','true');
					$('#addName').attr('readonly','true');
					
					var form = document.addForm;
					$(form).validator('destroy');
					util.form.validator.init($(form));
					
					$('#addModal').modal('show').find('.modal-title').html("修改"); 
				}
				
				// 审核
				function toApprove(e, value, row) {
	                var approveForm = document.approveForm
					$(approveForm).validator('destroy')
					util.form.validator.init($(approveForm));
	                $('#approveForm').clearForm().find('input[type=hidden]').val('')
					$('#approvetModal').modal('show');
					document.approveForm.oid.value=row.oid
	            }
				
				//审批操作通过按钮
				$("#approveBut").on('click',function(){
					if (!$('#approveForm').validator('doSubmitCheck')) return
					document.approveForm.approveStatus.value ='pass';
					$('#approveForm').ajaxSubmit({
	              		url: config.api.switchcraft.dealapprove,
	              		success: function (res) {
			          		if(res.errorCode==0){
			          			$('#approvetModal').modal('hide')
			            		$('#switchTable').bootstrapTable('refresh')
			          		}else{
			          			errorHandle(res);
			          		}
	              		}
	          		})
				})
				
				//审批操作驳回按钮
				$("#approveRefuseBut").on('click',function(){
					if (!$('#approveForm').validator('doSubmitCheck')) return
					document.approveForm.approveStatus.value ='refused';
					$('#approveForm').ajaxSubmit({
	              		url: config.api.switchcraft.dealapprove,
	              		success: function (res) {
				          	if(res.errorCode==0){
				          		 $('#approvetModal').modal('hide')
				            	 $('#switchTable').bootstrapTable('refresh')
				          	}else{
				          		errorHandle(res);
				          	}
	             		}
	         		})
				})
				
				//查询
				function getQueryParams(val) {
					var form = document.searchForm
					// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					pageOptions.code = form.code.value.trim()
					pageOptions.name = form.name.value.trim()
					pageOptions.status = form.status.value.trim()
					pageOptions.whiteStatus = form.whiteStatus.value.trim()
					return val
				}
				
				function getWhiteQueryParams(val) {
					var form = document.searchWhiteForm
					// 分页数据赋值
					page2Options.size = val.limit
					page2Options.number = parseInt(val.offset / val.limit) + 1
					page2Options.offset = val.offset
					page2Options.userAcc = form.userAcc.value.trim()
					page2Options.switchOid = _this.whiteInfo.switchOid
					return val
				}
				
				function getBlackQueryParams(val) {
					var form = document.searchBlackForm
					// 分页数据赋值
					page3Options.size = val.limit
					page3Options.number = parseInt(val.offset / val.limit) + 1
					page3Options.offset = val.offset
					page3Options.userAcc = form.userAcc.value.trim()
					page3Options.switchOid = _this.whiteInfo.switchOid
					return val
				}
				
				// 新建
				$('#doAdd').on('click', function() {
					if (!$('#addForm').validator('doSubmitCheck')) return
					// 防止重复提交
					$('#doAdd').attr("disabled","disabled");
					
					$('#addForm').ajaxSubmit({
						url: config.api.switchcraft.add,
						success: function(result) {
							if(result.errorCode==0){
								util.form.reset($('#addForm'))
								$('#switchTable').bootstrapTable('refresh')
								$('#addModal').modal('hide')
				            }else{
				            	errorHandle(result);
				            }
				            $('#doAdd').removeAttr("disabled"); 
						}
					})
				})
				
				// 新建白名单
				$('#doAddWhite').on('click', function() {
					if (!$('#addWhiteForm').validator('doSubmitCheck')) return
					// 防止重复提交
					$('#doAddWhite').attr("disabled","disabled");
					document.addWhiteForm.oid.value = _this.whiteInfo.switchOid;
					
					$('#addWhiteForm').ajaxSubmit({
						url: config.api.switchcraft.addwhite,
						success: function(result) {
							if(result.errorCode==0){
								util.form.reset($('#addWhiteForm'))
								$('#whiteTable').bootstrapTable('refresh')
								$('#addWhiteModal').modal('hide')
				            }else{
				            	errorHandle(result);
				            }
				            $('#doAddWhite').removeAttr("disabled"); 
						}
					})
				})
				
				// 新建黑名单
				$('#doAddBlack').on('click', function() {
					if (!$('#addBlackForm').validator('doSubmitCheck')) return
					// 防止重复提交
					$('#doAddBlack').attr("disabled","disabled");
					document.addBlackForm.oid.value = _this.whiteInfo.switchOid;
					
					$('#addBlackForm').ajaxSubmit({
						url: config.api.switchcraft.addblack,
						success: function(result) {
							if(result.errorCode==0){
								util.form.reset($('#addBlackForm'))
								$('#blackTable').bootstrapTable('refresh')
								$('#addBlackModal').modal('hide')
				            }else{
				            	errorHandle(result);
				            }
				            $('#doAddBlack').removeAttr("disabled"); 
						}
					})
				})
				
				//站内信详情
				function toDetail(value, row) {
					$$.detailAutoFix($('#detailtab'), row);
					_this.whiteInfo.switchOid = row.oid;
					$('#whiteTable').bootstrapTable('refresh');
					$('#blackTable').bootstrapTable('refresh');
					$('#detailModal').modal('show');
				}
			},
			bindEvent: function() {
				var _this = this;
				
				// 新建
				$('#addSwitch').on('click', function() {
					//清空信息
					util.form.reset($('#addForm'));
					 $('#addForm').clearForm().find('input[type=hidden]').val('')
					document.addForm.type.value = "switch";
					$('#addCode').removeAttr('readonly');
					$('#addName').removeAttr('readonly');
					
					//重置验证
					$('#addForm').validator('destroy')
					util.form.validator.init($('#addForm'));
					$('#addModal').modal('show').find('.modal-title').html("新建"); 
				})
				
				// 新建白名单
				$('#addWhite').on('click', function() {
					//清空信息
					util.form.reset($('#addWhiteForm'));
					 $('#addWhiteForm').clearForm().find('input[type=hidden]').val('')
					//重置验证
					$('#addWhiteForm').validator('destroy')
					util.form.validator.init($('#addWhiteForm'));
					
					$('#addWhiteModal').modal('show'); 
				})
				
				// 新建黑名单
				$('#addBlack').on('click', function() {
					//清空信息
					util.form.reset($('#addBlackForm'));
					 $('#addBlackForm').clearForm().find('input[type=hidden]').val('')
					//重置验证
					$('#addBlackForm').validator('destroy')
					util.form.validator.init($('#addBlackForm'));
					
					$('#addBlackModal').modal('show'); 
				})
			}
		}
	})