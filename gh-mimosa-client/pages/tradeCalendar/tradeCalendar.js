
define([
		'http',
		'config',
		'util',
		'extension'
	],
	function(http, config, util, $$) {
		return {
			name: 'tradeCalendar',
			approveInfo: {
				apprOid: '',
				apprResult: ''
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
					exchangeCD: "",
					isOpen: "",
					isWork: "",
					isWeekEnd: "",
					isMonthEnd: "",
					isQuarterEnd: "",
					isYearEnd: "",
					calendarDateBegin: "",
					calendarDateEnd: ""
				}
				var confirm = $('#confirmModal');
				
				var mailConfig = {
					ajax: function(origin) {
						http.post(util.buildQueryUrl(config.api.tradeCalendar.query, {
							page: pageOptions.number,
							rows: pageOptions.size,
							exchangeCD: pageOptions.exchangeCD,
							isOpen: pageOptions.isOpen,
							isWork: pageOptions.isWork,
							isWeekEnd: pageOptions.isWeekEnd,
							isMonthEnd: pageOptions.isMonthEnd,
							isQuarterEnd: pageOptions.isQuarterEnd,
							isYearEnd: pageOptions.isYearEnd,
							calendarDateBegin: pageOptions.calendarDateBegin,
							calendarDateEnd: pageOptions.calendarDateEnd
						}), function(rlt) {
							origin.success(rlt)
						})
					},
					idField: 'oid',
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getPageParams,
					columns: [{
						width: 60,
						align: 'center',
						formatter: function(val, row, index) {
							return pageOptions.offset + index + 1
						}
					}, {
						field: 'exchangeCD'
					}, {
						field: 'calendarDate',
						align:'right'
					}, {
						field: 'isOpen',
			            formatter: function (val) {
			            	return util.enum.transform('tradeCalendarTypes', val);
			            }
					}, {
						field: 'isWork',
			            formatter: function (val) {
			            	return util.enum.transform('tradeCalendarTypes', val);
			            }
					}, {
						field: 'prevTradeDate',
						align:'right'
					}, {
						field: 'prevWorkDate',
						align:'right'
					}, {
						field: 'isWeekEnd',
			            formatter: function (val) {
			            	return util.enum.transform('tradeCalendarTypes', val);
			            }
					}, {
						field: 'isMonthEnd',
			            formatter: function (val) {
			            	return util.enum.transform('tradeCalendarTypes', val);
			            }
					}, {
						field: 'isQuarterEnd',
			            formatter: function (val) {
			            	return util.enum.transform('tradeCalendarTypes', val);
			            }
					}, {
						field: 'isYearEnd',
			            formatter: function (val) {
			            	return util.enum.transform('tradeCalendarTypes', val);
			            }
					}, {
						align: 'center',
						formatter: function(val, row, index) {
//								var buttons = [{
//									text: '操作',
//									type: 'buttonGroup',
//									isCloseBottom: index >= $('#pageTable').bootstrapTable('getData').length - 1,
//									sub:[{
//										text: '编辑',
//										type: 'button',
//										class: 'item-edit',
//										isRender: true
//									},{
//										text: '删除',
//										type: 'button',
//										class: 'item-delete',
//										isRender: true
//									}]
//								}]
//							return util.table.formatter.generateButton(buttons, 'pageTable');
							var format =  '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-edit"></span>'
            				+'<span style=" margin:auto 0px auto 10px;cursor: pointer;width: 35px;" class="fa fa-trash-o item-delete"></span>';
							return format;
						},
						events: {
							'click .item-delete': toDelete,
							'click .item-edit': toEdit
						}
					}]
				}
				
				$('#pageTable').bootstrapTable(mailConfig);
				$$.searchInit($('#searchForm'), $('#pageTable'));
				util.form.validator.init($('#addForm'))
				
				// 添加修改提交
				$('#doAdd').on('click', function () {
			      	if (!$('#addForm').validator('doSubmitCheck')) return
			      	
					$('#refreshDiv').addClass('overlay');
					$('#refreshI').addClass('fa fa-refresh fa-spin');
					$('#addForm').ajaxSubmit({
			          	url: config.api.tradeCalendar.add,
			          	async:false,
			          	success: function (addResult) {
				            if(addResult.errorCode==0){
						    	$('#addModal').modal('hide');
				              	$('#pageTable').bootstrapTable('refresh')
						    }else{
					          	errorHandle(addResult);
				          		//去除重复提交样式
								$('#refreshDiv').removeClass('overlay');
								$('#refreshI').removeClass('fa fa-refresh fa-spin');
					        }
			          	}
				    })
      			})
				
				// 修改
				function toEdit(e, value, row) {
					//去除重复提交样式
					$('#refreshDiv').removeClass('overlay');
					$('#refreshI').removeClass('fa fa-refresh fa-spin');
					
					util.form.reset($('#addForm'));
                	                  
                  	$$.formAutoFix($('#addForm'), row); // 自动填充详情      
									
					var form = document.addForm
					$(form).validator('destroy')
					util.form.validator.init($(form));
				
                  	$('#addForm').validator('validate')
					$('#addModal').modal('show').find('.modal-title').html("修改交易日历"); 
				}
				
				// 删除
				function toDelete(e, value, row) {
					$('#confirmModal .confirmTitle').html('确定删除此条数据？');
					$$.confirm({
	                	container: confirm,
	                	trigger: this,
	                	accept: function () {
	                		http.post(config.api.tradeCalendar.delete, {
	                			data: {
	                				oid: row.oid
	                      		},
	                      		contentType: 'form',
	                    	}, function (result) {
	                      	$('#pageTable').bootstrapTable('refresh')
	                    })
	                  }
	                })
				}
				
				//查询
				function getPageParams(val) {
					var form = document.searchForm
					// 分页数据赋值
					pageOptions.size = val.limit
					pageOptions.number = parseInt(val.offset / val.limit) + 1
					pageOptions.offset = val.offset
					
					pageOptions.exchangeCD = form.exchangeCD.value.trim();
					pageOptions.isOpen = form.isOpen.value.trim();
					pageOptions.isWork = form.isWork.value.trim();
					pageOptions.isWeekEnd = form.isWeekEnd.value.trim();
					pageOptions.isMonthEnd = form.isMonthEnd.value.trim();
					pageOptions.isQuarterEnd = form.isQuarterEnd.value.trim();
					pageOptions.isYearEnd = form.isYearEnd.value.trim();
					pageOptions.calendarDateBegin = form.calendarDateBegin.value.trim();
					pageOptions.calendarDateEnd = getNextDate(pageOptions.calendarDateBegin);
					pageOptions.calendarDateEnd = form.calendarDateEnd.value.trim();
					
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
				
			},
			bindEvent: function() {
				var _this = this;
				
				$("#createEntity").on("click",function(){
	      			util.form.reset($('#addForm'));
	      			
	      			var form = document.addForm
					$(form).validator('destroy')
					util.form.validator.init($(form));
					
	      			//去除重复提交样式
					$('#refreshDiv').removeClass('overlay');
					$('#refreshI').removeClass('fa fa-refresh fa-spin');
					
			        $('#addForm').clearForm().find('input[type=hidden]').val('')
			        $('#addModal').modal('show').find('.modal-title').html("新建交易日历");
				})
			}
		}
	})