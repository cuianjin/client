/**
 * 产品准入管理
 */
define([
'http',
'config',
'util',
'extension'
], function (http, config, util, $$) {
	return {
    name: 'productAccess',
    init: function () {
    	// js逻辑写在这里
    	// 数据表格分页、搜索条件配置
    	var pageOptions = {
				number: 1,
				size: 10,
				name: '',
				type: ''
			}
		// 用于存储表格checkbox选中的项
		var checkItems = []
		var selectProductOid 
		// 用于存储选择的渠道checkbox选中的项
		var checkChannels = []
    	// 数据表格配置
    	var tableConfig = {
    		ajax: function (origin) {
    			http.post(
    				config.api.productApproveList, 
    				{
    					data: {
    						page: pageOptions.number,
    						rows: pageOptions.size,
    						name: pageOptions.name,
    						type: pageOptions.type
    					},
    					contentType: 'form'
    				},
    				function (rlt) {
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
    		onLoadSuccess: function () {},
    		columns: [
    			{
					field: 'code',
					align: 'center'
				},
				{
					field: 'name',
					align: 'center'
				},
     			{
					field: 'typeName',
					align: 'center'
				},
				{
					field: 'administrator',
					align: 'center'
				},
				{
					align: 'center',
					field: 'status',
					formatter: function (val) {
						switch (val) {
							case 'CREATE': return '新建'
							case 'UPDATE': return '修改'
							case 'AUDITING': return '审核中'
							case 'AUDITFAIL': return '审核不通过'
							case 'AUDITPASS': return '审核通过'
							case 'REVIEWFAIL': return '复核不通过'
							case 'REVIEWPASS': return '复核通过'
							case 'ADMITFAIL': return '准入不通过'
							case 'ADMITPASS': return '准入通过'
							case 'NOTSTARTRAISE': return '未开始募集'
							case 'RAISING': return '募集中(募集期)'
							case 'NOESTALISHING': return '成立未开始'
							case 'ESTALISHING': return '已成立'
							default : return '-'
						}
					}
				},
				{
					align: 'center',
					field: 'durationPeriod',
					formatter: function (val, row, index) {
						var typeOid = row.typeOid;  
						if(typeOid=="PRODUCTTYPE_01") {
							return row.durationPeriod+"天";
						} else {
							return "不固定";
						}
					}
				},
				{
					field: 'expAror',
					align: 'center',
					formatter: function (val, row, index) {
						if(row.expArorSec!=null && row.expAror!=row.expArorSec) {
							return row.expAror+"%"+"~"+row.expArorSec+"%";
						}
						return row.expAror+"%";
					}
				},
				{
					align: 'center',
					field: 'raisedTotalNumber',
					formatter: function (val, row, index) {
						var typeOid = row.typeOid;  
						if(typeOid=="PRODUCTTYPE_01") {
							return row.raisedTotalNumber;
						} else {
							return "不限";
						}
					}
				},
				{
					field: 'netUnitShare',
					align: 'center'
				},
				{
					align: 'center',
					field: 'channelNum'
				},
				{
					field: 'assetPoolName',
					align: 'center'
				},
				{
					field: 'applicant',
					align: 'center'
				},
				{
					field: 'applyTime',
					align: 'center',
					formatter: function (val) {
						return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
					}
				},
				{
					field: 'auditor',
					align: 'center'
				},
				{
					field: 'auditTime',
					align: 'center',
					formatter: function (val) {
						return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
					}
				},
				{
					field: 'reviewer',
					align: 'center'
				},
				{
					field: 'reviewTime',
					align: 'center',
					formatter: function (val) {
						return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
					}
				},
				{
					align: 'center',
					formatter: function(val, row) {
						var buttons = [
		           	    	{
		           	      		text: '详情',
		           	      		type: 'button',
		           	      		class: 'item-detail',
		           	      		isRender: true
		           	    	},
		           	    	/*{
		           	    		text: '选择渠道',
		           	    		type: 'button',
		           	    		class: 'item-channel',
		           	    		isRender: true
		           	    	},*/
		           	    	{
		           	    		text: '批准',
		           	    		type: 'button',
		           	    		class: 'item-approve',
		           	    		isRender: true
		           	    	},
		           	    	{
		          	      		text: '驳回',
		           	      		type: 'button',
		           	      		class: 'item-reject',
		           	      		isRender: true
		           	    	}
		           	    ];
		           	  	return util.table.formatter.generateButton(buttons, 'productAccessTable');
		           	},
		           	events: {
						'click .item-detail': function(e, value, row) {
							http.post(config.api.productDetail, {
								data: {
									oid: row.oid
								},
								contentType: 'form'
							}, function(result) {
								if (result.errorCode == 0) {
									var data = result;
									
									switch (data.typeOid) {
										case 'PRODUCTTYPE_01':
											$('#detailProductType01Area').show()
											$('#detailProductType02Area').hide()
											break
										case 'PRODUCTTYPE_02':
											$('#detailProductType02Area').show()
											$('#detailProductType01Area').hide()
											break
									}
									
									var productDetailInvestFiles = []
									if(data.investFiles!=null && data.investFiles.length>0) {
										for(var i=0;i<data.investFiles.length;i++){
											productDetailInvestFiles.push(data.investFiles[i])
										}
									}
									$('#productDetailInvestFileTable').bootstrapTable('load', productDetailInvestFiles)
									
									var productDetailFiles = []
									if(data.files!=null && data.files.length>0) {
										for(var i=0;i<data.files.length;i++){
											productDetailFiles.push(data.files[i])
										}
									}
									$('#productDetailFileTable').bootstrapTable('load', productDetailFiles)
									
									var productRewards = []
									if(data.rewards!=null && data.rewards.length>0) {
										for(var i=0;i<data.rewards.length;i++){
											productRewards.push(data.rewards[i])
										}
									}
									$('#productRewardTable').bootstrapTable('load', productRewards)
									
									$$.detailAutoFix($('#productDetailModal'), data); // 自动填充详情
									$('#productDetailModal').modal('show');
								} else {
									alert(查询失败);
								}
							})
						},
						'click .item-channel': function(e, value, row) {
		                	selectProductOid = row.oid
							http.post(
    							config.api.productChooseChannelList, 
    							{
 		   							data: {
    									productOid:row.oid
    								},
    								contentType: 'form'
    							},
    							function(result) {
									var data = result.rows;
									$('#productChooseChannelTable').bootstrapTable('load', data)
									$('#channelModal').modal('show');
								}
    						)
							
						},
						'click .item-approve': function(e, value, row) {
							selectProductOid = row.oid;
							$("#oid").val(row.oid)
							$("#admitComment").val("")
							$$.confirm({
								container: $('#doAdmitConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.productAdmitApprove, {
										data: {
											oid: row.oid
										},
										contentType: 'form',
									}, function(result) {
										$('#productAccessTable').bootstrapTable('refresh')
									})
								}
							})
						},
						'click .item-reject': function(e, value, row) {
							selectProductOid = row.oid;
							$("#oid").val(row.oid)
							$("#admitComment").val("")
							$$.confirm({
								container: $('#doAdmitConfirm'),
								trigger: this,
								accept: function() {
									var auditComment = $("#admitComment").val()
									if(null==auditComment || ""==auditComment) {
										
									} else {
										http.post(config.api.productAdmitReject, {
											data: {
												oid: row.oid,
												auditComment: auditComment
											},
											contentType: 'form',
										}, function(result) {
											$('#productAccessTable').bootstrapTable('refresh')
										})
									}
								}
							})
						}
					}
				},
			]
		}
    	// 数据表格初始化
    	$('#productAccessTable').bootstrapTable(tableConfig)
    	// 搜索表单初始化
    	$$.searchInit($('#searchForm'), $('#productAccessTable'))
    	
    	// 详情附件表格配置
    	var productDetailInvestFileTableConfig = {
			columns: [
				{
					field: 'name',
				},
				{
					field: 'operator',
				},
				{
					field: 'createTime',
				},
				{
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}]
						return util.table.formatter.generateButton(buttons, 'productDetailInvestFileTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl
						}
					}
				}
			]
		}
    	// 详情投资协议书表格初始化
		$('#productDetailInvestFileTable').bootstrapTable(productDetailInvestFileTableConfig)
		
    	// 详情附件表格配置
    	var productDetailFileTableConfig = {
			columns: [
				{
					field: 'name',
				},
				{
					field: 'operator',
				},
				{
					field: 'createTime',
				},
				{
					width: 100,
					align: 'center',
					formatter: function() {
						var buttons = [{
							text: '下载',
							type: 'button',
							class: 'item-download'
						}]
						return util.table.formatter.generateButton(buttons, 'productDetailFileTable')
					},
					events: {
						'click .item-download': function(e, value, row) {
							location.href = row.furl
						}
					}
				}
			]
		}
    	// 详情附件表格初始化
		$('#productDetailFileTable').bootstrapTable(productDetailFileTableConfig)
		
		// 产品详情设置奖励收益表格配置
		var productRewardTableConfig = {
			columns: [
				{
					field: 'startDate',
					align: 'center',
					formatter: function (val, row, index) {
						if(row.endDate!=null && row.endDate!="") {
					        return row.startDate+"天"+"-"+row.endDate+"天";
						} else {
							return "大于等于"+row.startDate+"天";
						}
						
					}
				},
				{
					field: 'ratio',
					align: 'center'
				},
			]
		}
		// 设置奖励收益表格初始化
		$('#productRewardTable').bootstrapTable(productRewardTableConfig)
    	
    	// 表格querystring扩展函数，会在表格每次数据加载时触发，用于自定义querystring
    	function getQueryParams (val) {
    		var form = document.searchForm
    		pageOptions.size = val.limit
    		pageOptions.number = parseInt(val.offset / val.limit) + 1
    		pageOptions.name = form.name.value.trim()
    		pageOptions.type = form.type.value.trim()
    		return val
  		}
		
		// 数据表格配置
		var channelsTableConfig = {
			columns: [
    			{
    				checkbox: true,
    				field: 'selectStatus',
    				align: 'center',
    				formatter: function (val, row, index) {
					    var selectStatus = row.selectStatus
					    if(true==selectStatus) {
					        if (checkChannels.indexOf(row) < 0){
			            		checkChannels.push(row)
					        }
					    }
					    return selectStatus
					}
    			},
    			{
    				field: 'channelId',
    				align: 'center'
				},
				{
			   		field: 'channelName',
			   		align: 'center'
				},
				{
					align: 'center',
            		field: 'channelStatus',
					formatter: function (val, row, index) {
						var channelStatus = row.channelStatus
						if("on"==channelStatus) {
						    return "已启用"
						} else if("off"==channelStatus) {
						    return "已停用"
						}
					}
				},
				{
					field: 'channelFee',
					align: 'center',
					formatter: function (val, row, index) {
					    var channelFee = row.channelFee
					    if(channelFee!=null && channelFee!="") {
					        return channelFee+"%"
					    }
						return "";
					}
				}
			],
			// 单选按钮选中一项时
			onCheck: function (row) {
			    if (checkChannels.indexOf(row) < 0){
			        checkChannels.push(row)
			    }
			},
			// 单选按钮取消一项时
			onUncheck: function (row) {
			    checkChannels.splice(checkChannels.indexOf(row), 1)
			},
			// 全选按钮选中时
			onCheckAll: function (rows) {
			    checkChannels = rows.map(function (item) {
				    return item
				})
			},
			// 全选按钮取消时
			onUncheckAll: function () {
				checkChannels = []
			}
		}
				            		
		// 数据表格初始化
    	$('#productChooseChannelTable').bootstrapTable(channelsTableConfig)
    	
    	
    	// 选择渠道点击确定按钮事件
		$('#doChooseChannel').on('click', function () {
			// 获取id数组
			var channelOids = checkChannels.map(function (item) {
				return item.oid
			})
			// 提交数组
			http.post(
				config.api.saveProductChannel, 
				{
					data: {
						productOid: selectProductOid, 
						channelOid: JSON.stringify(channelOids)
					},
					contentType: 'form',
				}, 
				function(result) {
					checkChannels = []
					$('#channelModal').modal('hide')
					if (result.errorCode == 0) {
						$('#productAccessTable').bootstrapTable('refresh')
					}
				}
			)
				
		})
    	     
    	  
    }
  }
})
