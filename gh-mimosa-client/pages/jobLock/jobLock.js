/**
 * 产品申请管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'jobLock',
		init: function() {
			// js逻辑写在这里
			/**
			 * 数据表格分页、搜索条件配置
			 */
			var pageOptions = {
				number: 1,
				size: 10,
				jobId: ''
			}

			/**
			 * 用于存储表格checkbox选中的项
			 */
			var checkItems = []

			var selectProductOid = ""
			var setDate = getCurentDate()

			function getCurentDate() {
				var now = new Date();
				var year = now.getFullYear(); //年
				var month = now.getMonth() + 1; //月
				var day = now.getDate(); //日
				var clock = year + "-";
				if(month < 10) {
					clock += "0";
				}
				clock += month + "-";

				if(day < 10) {
					clock += "0";
				}
				clock += day;
				return(clock);
			}
		

			/**
			 * 数据表格配置  
			 */
			var tableConfig = {
				ajax: function(origin) {
					http.post(
						config.api.jobList, {
							data: {
								page: pageOptions.number,
								rows: pageOptions.size,
								jobId: pageOptions.jobId
							},
							contentType: 'form'
						},
						function(rlt) {
							console.info(rlt);
							origin.success(rlt)
						}
					)
				},
				pageNumber: pageOptions.number,
				pageSize: pageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams,
				onLoadSuccess: function() {},
				onClickCell: function (field, value, row, $element) {
				  switch (field) {
		        	case 'jobId':
			        	queryInfo(value,row)
			        	break
				  }
				},
				columns: [{
					width: 30,
					align: 'center',
					formatter: function(val, row, index) {
						return(pageOptions.number - 1) * pageOptions.size + index + 1
					}
				}, {
					field: 'jobName',
					/*align: 'center',*/
					class: 'item-detail table_title_detail'					
				}, {
					field: 'jobId',
					class: 'item-detail table_title_detail'
					/*align: 'center',*/
				},{
					field: 'jobTime',
					/*align: 'center',*/
				}, {
					field: 'jobStatus',
					/*align: 'center',*/
					formatter: function(val) {
							return util.enum.transform('jobStatus', val);
					}
				}, {
					field: 'createTime',
					align: 'right',
				}, {
					field: 'updateTime',
					align: 'right',
				},{
					width: 256,
					align: 'center',
					formatter: function(val, row) {
						var buttons = [{
							text: '执行',
							type: 'button',
							class: 'item-execute',
							isRender: row.checkRunTimes  
						}
//						,{
//							text: '详情',
//							type: 'button',
//							class: 'item-detail',
//							isRender: true
//						}
						];
						return util.table.formatter.generateButton(buttons, 'productDesignTable');
					},
					events: {
						'click .item-execute': function(e, value, row) {
							if(!$("#inDate").val().trim()){
								toastr.error('执行日期不能为空!', '错误信息', {
									timeOut: 3600000
								})
								return
							}
							var btn = $(this);
							btn.attr("disabled","disabled");
							http.post(config.api.jobExecuteTask, {
								data: {
									inDate: $("#inDate").val().trim(),
									jobId:row.jobId,
									token:$("#token").val()
								},
								contentType: 'form'
							}, function(result) {
								btn.attr("disabled",false);
							})
						},
						

					}
				
				}],

			}

			/**
			 * 数据表格初始化
			 */
			$('#productDesignTable').bootstrapTable(tableConfig)
			
			$$.searchInit($('#searchForm'), $('#productDesignTable'))


			/**
			 * 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			 * @param {Object} val
			 */
			function getQueryParams(val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.jobId = form.jobId.value
				return val
			}
			
			
			/**
			 * 数据表格配置(任务日志数据)
			 */
			var pageLogOptions = {
				number: 1,
				size: 10,
				jobId:"",
				createTime:"",
				jobStatus:""
			}
			var tableConfigJobLog = {
				ajax: function(origin) {
						http.post(
							config.api.jobLogList, {
								data: {
									page: pageLogOptions.number,
									rows: pageLogOptions.size,
									jobId:pageLogOptions.jobId,
									createTime:pageLogOptions.createTime,
									jobStatus:pageLogOptions.jobStatus
								},
								contentType: 'form'
							},
							function(rlt) {
								console.info(rlt);
								origin.success(rlt)
							}
						)
					},
					pageNumber: pageLogOptions.number,
					pageSize: pageLogOptions.size,
					pagination: true,
					sidePagination: 'server',
					pageList: [10, 20, 30, 50, 100],
					queryParams: getQueryLogParams,
					onLoadSuccess: function() {},
					columns: [{
						width: 30,
						align: 'center',
						formatter: function(val, row, index) {
							return(pageOptions.number - 1) * pageOptions.size + index + 1
						}
					}, {
						field: 'jobId',
						align: 'center',
						formatter: function(val) {
							return util.enum.transform('jobLockName', val);
						}
					}, {
						field: 'jobStatus',
						align: 'center',
						formatter: function(val) {
							return util.enum.transform('jobLogStatus', val);
						}
					}, {
						field: 'batchStartTime',
						align: 'center'
					}, {
						field: 'batchEndTime',
						align: 'center'
					}, {
						field: 'jobMessage',
						align: 'center'
					}, {
						field: 'machineIp',
						align: 'center'
					}, {
						field: 'createTime',
						align: 'center'
					}, {
						field: 'updateTime',
						align: 'center'
					}]
			}
			/**
			 * 数据表格初始化
			 */
			$('#JobLogTable').bootstrapTable(tableConfigJobLog)

			/**
			 * 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
			 * @param {Object} val
			 */
			function getQueryLogParams(val) {
				var serchLogForm = document.searchLogForm
				pageLogOptions.size = val.limit
				pageLogOptions.number = parseInt(val.offset / val.limit) + 1
				pageLogOptions.createTime = serchLogForm.createTime.value.trim()
				pageLogOptions.jobStatus = serchLogForm.jobStatus.value.trim()
				return val
			}
			
			 $$.searchInit($('#searchLogForm'), $('#JobLogTable'))
			 
			function queryInfo(value,row){

					var jobId = row.jobId
					$('#detailProductType01Area').show()
					$('#productDetailModal').modal('show');
					pageLogOptions.jobId = row.jobId;
					$('#JobLogTable').bootstrapTable('refresh');

					
			}

		}
	}

})