
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'mail',
			deleteInfo: {
				apprOid: ''
			},
		  	approveInfo:{
		  		oid:''
		  	},
			init: function() {
				var _this = this;
				_this.pagesInit();
				_this.bindEvent();
			},
			pagesInit: function() {
				var _this = this;
				
				var mailOptions = {
					number: 1,
					size: 10,
					offset: 0,
					phone: '',
					createTimeBegin: '',
					createTimeEnd: '',
					mailType: '',
					mailStatus: ''
				}
				var confirm = $('#confirmModal');
				
				var mailConfig = {
					ajax: function(origin) {
						http.post(util.buildQueryUrl(config.api.mail.queryPage, {
							page: mailOptions.number,
							rows: mailOptions.size,
							phone: mailOptions.phone,
							createTimeBegin: mailOptions.createTimeBegin,
							createTimeEnd: mailOptions.createTimeEnd,
							mailType: mailOptions.mailType,
							status: mailOptions.mailStatus
						}), function(rlt) {
							origin.success(rlt)
						})
					},
					idField: 'oid',
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getMailParams,
					onClickCell: function (field, value, row, $element) {
					  	switch (field) {
			        		case 'mesTitle':toMailDetail(value,row)
					  	}
					},
					columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return mailOptions.offset + index + 1
						}
					}, {
						field: 'mesTitle',
//						align: 'left',
						class: 'table_title_detail'
					}, {
						field: 'mailType',
//						align: 'left',
						formatter: function(val, row, index) {
							return util.enum.transform('mailTypes', val);
						}
					}, {
						field: 'phone',
						align: 'right',
						formatter: function (val, row, index) {
              				return val ? val : '-';
            			}
					}, {
						field: 'mesType',
//						align: 'left',
						formatter: function(val, row, index) {
							return util.enum.transform('mesTypes', val);
						}
					}, {
						field: 'requester',
//						align: 'left',
						formatter: function (val, row, index) {
			               return val ? val : '-';
			            }
					}, {
						field: 'createTime',
						align: 'right',
						formatter: function(val, row, index) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					}, {
						field: 'approver',
//						align: 'left',
						formatter: function (val, row, index) {
			               return val ? val : '-';
			            }
					}, {
						field: 'updateTime',
						align: 'right',
						formatter: function(val, row, index) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss');
						}
					}, {
						field: 'status',
//						align: 'left',
						formatter: function(val, row, index) {
							return util.enum.transform('mailStatus', val);
						}
					}, {
						align: 'center',
						formatter: function(val, row, index) {
							var buttons = [{
			            		text: '审核',
			            		type: 'button',
			            		class: 'item-approve',
			            		isRender: row.status=='toApprove'
			            	}]
							var format = util.table.formatter.generateButton(buttons, 'bannerTable')
				            	if( row.status != 'delete' &&　row.status != 'pass'){
				            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-edit "></span>'
				            		
				            	}
				            	if(row.status != 'delete'){
				            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-trash-o item-delete"></span>';
				            	}
			            	return format
						},
						events: {
							'click .item-delete': toDelete,
							'click .item-edit': toEdit,
							'click .item-approve': toApprove
						}
					}]
				}
				
				$('#mailTable').bootstrapTable(mailConfig);
				$$.searchInit($('#mailSearchForm'), $('#mailTable'));
				
				// 审核
				function toApprove(e, value, row) {
	                var approveForm = document.approveForm
					$(approveForm).validator('destroy')
					util.form.validator.init($(approveForm));
	                $('#approveForm').clearForm().find('input[type=hidden]').val('')
					$('#approvetModal').modal('show');
					document.approveForm.aoid.value=row.oid
	            }
				
				//审批操作通过按钮
				$("#approveBut").on('click',function(){
					if (!$('#approveForm').validator('doSubmitCheck')) return
					document.approveForm.approveResult.value ='pass';
					$('#approveForm').ajaxSubmit({
	              		url: config.api.mail.approve,
	              		success: function (res) {
	              			_this.approveInfo.oid="";
			          		if(res.errorCode==0){
			          			$('#approvetModal').modal('hide')
			            		$('#mailTable').bootstrapTable('refresh')
			          		}else{
			          			errorHandle(res);
			          		}
	              		}
	          		})
				})
				
				//审批操作驳回按钮
				$("#approveRefuseBut").on('click',function(){
					if (!$('#approveForm').validator('doSubmitCheck')) return
					document.approveForm.approveResult.value ='refused';
					  
					$('#approveForm').ajaxSubmit({
	              		url: config.api.mail.approve,
	              		success: function (res) {
		            		_this.approveInfo.oid="";
				          	if(res.errorCode==0){
				          		 $('#approvetModal').modal('hide')
				            	 $('#mailTable').bootstrapTable('refresh')
				          	}else{
				          		errorHandle(res);
				          	}
	             		}
	         		})
				})
				
				// 删除
				function toDelete(e, value, row) {
					// 重置和初始化表单验证
					$("#deleteForm").validator('destroy')
					util.form.validator.init($("#deleteForm"));

					$('#deleteForm').clearForm().find('input[type=hidden]').val('')
					_this.deleteInfo.apprOid = row.oid;
					$('#deleteModal').modal('show');
				}
				
				//查询
				function getMailParams(val) {
					var form = document.mailSearchForm
					// 分页数据赋值
					mailOptions.size = val.limit
					mailOptions.number = parseInt(val.offset / val.limit) + 1
					mailOptions.offset = val.offset
					mailOptions.phone = form.phone.value.trim()
					mailOptions.createTimeBegin = form.createTimeBegin.value.trim()
					mailOptions.createTimeEnd = form.createTimeEnd.value.trim()
					mailOptions.createTimeEnd = getNextDate(mailOptions.createTimeEnd)
					mailOptions.mailType = form.mailType.value.trim()
					mailOptions.mailStatus = form.status.value.trim()
					return val
				}
				
				function getNextDate(val){
					if (val && val!=''){
						var now = new Date(val);
						var next = now.getTime()+24*60*60*1000;
						var nextDate = util.table.formatter.timestampToDate(next, 'YYYY-MM-DD');
						return nextDate;
					}else{
						return val;
					}
				}
				
				// 新建站内信 - 确定按钮点击事件
				$('#doAdd').on('click', function() {
					if (!$('#addForm').validator('doSubmitCheck')) return
					// 防止重复提交
					$('#doAdd').attr("disabled","disabled");
					$('#refreshDiv').addClass('overlay');
				  	$('#refreshI').addClass('fa fa-refresh fa-spin');
					
					document.addForm.mailType.value = $('#mailType').val();
					
					$('#addForm').ajaxSubmit({
						url: config.api.mail.add,
						success: function(result) {
							if(result.errorCode==0){
								util.form.reset($('#addForm'))
								$('#mailTable').bootstrapTable('refresh');
								$('#addMailModal').modal('hide')
							}else{
				            	errorHandle(result);
				            }
							$('#doAdd').removeAttr("disabled"); 
							//去除重复提交样式
							$('#refreshDiv').removeClass('overlay');
							$('#refreshI').removeClass('fa fa-refresh fa-spin');
						}
					})
				})
				
				//站内信详情
				function toMailDetail(value, row) {
					$$.detailAutoFix($('#remarkModal'), row);
					$('#remarkModal').modal('show');
				}
				
				// 编辑
				function toEdit(e, value, row) {
					//去除重复提交样式
					$('#refreshDiv').removeClass('overlay');
					$('#refreshI').removeClass('fa fa-refresh fa-spin');
							
					//清空信息
					util.form.reset($('#addForm'));
					$('#addForm').clearForm().find('input[type=hidden]').val('')
					// 去除重复提交控制
					$('#doAdd').removeAttr("disabled"); 
					
					$$.formAutoFix($('#addForm'), row); // 自动填充详情      
					
					if (row.mailType == 'person'){
						$("#mailType").val("person");
						$('#add_phone').show();
//						$('#phone').attr("readonly","readonly");
						$('#phone').attr('required','required');
					}else if (row.mailType == 'all'){
			        	$("#mailType").val("all");
			        	$('#add_phone').hide();
//			        	$('#phone').removeAttr("readonly");
			        	$('#phone').removeAttr('required');
					}
//					$("#mailType").attr("disabled","disabled");
//					$('#mailType').attr("readonly","readonly");
					
					//重置验证
					$('#addForm').validator('destroy')
					util.form.validator.init($('#addForm'));
					
					$('#addMailModal').modal('show').find('.modal-title').html("修改站内信"); 
				}
			},
			bindEvent: function() {
				var _this = this;
				
				// 新建站内信按钮点击事件
				$('#addMail').on('click', function() {
					//去除重复提交样式
					$('#refreshDiv').removeClass('overlay');
					$('#refreshI').removeClass('fa fa-refresh fa-spin');
					
					//清空信息
					util.form.reset($('#addForm'));
					$('#addForm').clearForm().find('input[type=hidden]').val('')
					
					$("#mailType").val("all");
					$(document.addForm.mailType).val("all");
					$('#add_phone').hide();
			        $('#phone').removeAttr("readonly");
					$("#mailType").removeAttr("readonly");
					$("#mailType").removeAttr("disabled");
					$('#phone').removeAttr('required');
					
					//重置验证
					$('#addForm').validator('destroy')
					util.form.validator.init($('#addForm'));
					// 去除重复提交控制
					$('#doAdd').removeAttr("disabled"); 
					
					$('#addMailModal').modal('show').find('.modal-title').html("新建站内信"); 
				})
				
				// 新建站内信类型改变
				$("#mailType").change(function(){
					var type=$("#mailType").val();
					if(type=='all'){
						$('#add_phone').hide();
			        	$('#phone').removeAttr('required');
			        	$(document.addForm.mailType).val("all");
					}else{
						$('#add_phone').show();
			        	$('#phone').attr('required','required');
			        	$(document.addForm.mailType).val("person");
					}
					
					var form = document.addForm
					$(form).validator('destroy')
					util.form.validator.init($(form));
				});
			    
			    //删除操作按钮
				$("#deleteBut").on('click', function() {
					if (!$('#deleteForm').validator('doSubmitCheck')) return
					document.deleteForm.aoid.value = _this.deleteInfo.apprOid;
					$('#deleteForm').ajaxSubmit({
						url: config.api.mail.delete,
						success: function(res) {
							if (res.errorCode == 0) {
								$('#deleteModal').modal('hide')
								$('#mailTable').bootstrapTable('refresh')
							} else {
								errorHandle(res);
							}
						}
					})
				})
			}
		}
	})