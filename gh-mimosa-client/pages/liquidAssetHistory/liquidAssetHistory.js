/**
 * 现金管理类工具备选库
 */
define([
	'http',
	'config',
	'extension',
	'util'
], function(http, config, $$, util) {
	return {
		name: 'liquidAssetHistory',
		init: function() {
			// js逻辑写在这里
			var cashtool; // 缓存 选中的某一行的 现金工具信息
			// 分页配置
			var pageOptions = {
					op: 'historyList',
					page: 1,
					rows: 10
				}
				// 数据表格配置
			var tableConfig = {
				ajax: function(origin) {
					http.post(config.api.liquidAssetPool.list, {
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
				onClickRow: function(row, $element) {
					cashtool = row;
				},
				onClickCell: function (field, value, row, $element) {
				  	switch (field) {
		        		case 'name':toDetail(value,row);
				  	}
				},
				columns: [{ // 代码
					field: 'sn',
					align:'left'
				}, { // 基金名称
					field: 'name',
					align:'left',
					class: 'table_title_detail'
				}, { // 类型
					field: 'type',
					align:'left',
					formatter: function(val) {
						if(val == "CASHTOOLTYPE_01") {
							return "货币基金";
						} else if(val == "CASHTOOLTYPE_02") {
							return "协定存款";
						} else {
							return "";
						}
					}
				}, { // 7日年化收益率
					field: 'weeklyYield',
					align:'right',
					formatter: function(val) {
						if (val)
							return (val * 100).toFixed(3) + "%";
						return val;
					}
				}, { // 万份收益
					field: 'dailyProfit',
					align:'right',
					formatter: function(val) {
						if (val)
							return val.toFixed(4) + '元';
						return val;
					}
				}, { // 状态
					field: 'state',
					align:'left',
					formatter: function(val) {
						return util.enum.transform('cashtoolStates', val);
					}
				}/*, {
					align: 'center',
					formatter: function(val, row, index) {
						var buttons;
						if(row.state == 'invalid'){
							buttons = [{}]
						}else if(row.state !== 'invalid' || row.state === 'collecting'){
							buttons = [{
								text: '操作',
								type: 'buttonGroup',
								isRender: true,
								sub: [{
									text: '移除出库',
									class: 'item-remove',
									isRender: row.state !== 'invalid'
								}, {
									text: '收益采集',
									class: 'item-cashToolRevenue',
									isRender: row.state === 'collecting'
								}]
							}]
						}
						return util.table.formatter.generateButton(buttons, 'dataTable');
					},
					events: {
						'click .item-remove': function(e, value, row) { // 移除出库
							$("#confirmTitle").html("确定移除现金管理工具？")
							$$.confirm({
								container: $('#doConfirm'),
								trigger: this,
								accept: function() {
									http.post(config.api.cashToolPool.remove, {
										data: {
											oid: row.oid
										},
										contentType: 'form'
									}, function(result) {
										if (result.errorCode == 0) {
											$('#dataTable').bootstrapTable('refresh');
										} else {
											alert('移除现金管理工具失败');
										}
									})
								}
							})

						},
						'click .item-cashToolRevenue': function(e, value, row) { // 收益采集-显示弹窗
//							cashtool = row;

							$('#revenueTable').bootstrapTable('refresh');
							
							row.cashtoolOid = row.oid; // 手动为 cashtoolOid 赋值
							
							$(document.liquidAssetYieldForm.cashtoolOid).val(row.oid);
							
							$$.detailAutoFix($('#cashToolDetail'), row); // 自动填充详情
//							$$.formAutoFix($('#liquidAssetYieldForm'), row); // 自动填充表单

							// 重置和初始化表单验证
							$("#liquidAssetYieldForm").validator('destroy')
							util.form.validator.init($("#liquidAssetYieldForm"));

							$('#liquidAssetYieldModal').modal('show');
						}

					}
				}*/]
			}

			// 分页配置
			var revenuePageOptions = {
					page: 1,
					rows: 10
				}
				// 数据表格配置
			var revenueTableConfig = {
				ajax: function(origin) {
					if (revenuePageOptions.cashtoolOid) {
						http.post(config.api.cashToolPool.listRevenue, {
							data: revenuePageOptions,
							contentType: 'form'
						}, function(rlt) {
							origin.success(rlt)
						})
					}
				},
				pageNumber: revenuePageOptions.page,
				pageSize: revenuePageOptions.rows,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getRevenueQueryParams,
				onLoadSuccess: function() {},
				columns: [{
					//编号
					// field: 'oid',
					align: 'center',
					width: 60,
					formatter: function(val, row, index) {
						return index + 1
					}
				}, { // 交易日
					field: 'dailyProfitDate',

				}, { // 万份收益
					field: 'dailyProfit',
					formatter: function(val, row, index) {
						if (val)
							return val.toFixed(4) + '元';
						return val;
					}
				}, { // 7日年化收益
					field: 'weeklyYield',
					formatter: function(val, row, index) {
						if (val)
							return (val * 100).toFixed(3) + "%";
						return val;
					}
				}, { // 录入时间
					field: 'createTime',
					visible: false,
				}, { // 操作员
					field: 'operator',
					visible: false,
				}, ],
			}

			$('#revenueTable').bootstrapTable(revenueTableConfig);

			// 初始化数据表格
			$('#dataTable').bootstrapTable(tableConfig)
				// 搜索表单初始化
			$$.searchInit($('#searchForm'), $('#dataTable'))
			
//			// 查询资产池拥有该标的信息
//			var assetPoolPageOptions = {
//					page: 1,
//					rows: 10
//				}
//				// 数据表格配置
//			var assetPoolTableConfig = {
//				ajax: function(origin) {
//					http.post(config.api.duration.target.getDataByCashtoolOid, {
//						data: assetPoolPageOptions,
//						contentType: 'form'
//					}, function(rlt) {
//						origin.success(rlt)
//					})
//				},
//				pageNumber: assetPoolPageOptions.page,
//				pageSize: assetPoolPageOptions.rows,
//				pagination: true,
//				sidePagination: 'server',
//				pageList: [10, 20, 30, 50, 100],
//				queryParams: getAssetPoolQueryParams,
//				onLoadSuccess: function() {},
//				columns: [{ // 编号
//					field: 'assetPoolOid',
//					visible: false
//				}, { // 资产池名称
//					field: 'assetPoolName',
//				}, { // 资产池金额
//					field: 'volume',
//					formatter: function(val) {
//						if (val)
//							return (val / 10000).toFixed(2) + "万";
//						return val;
//					}
//				}]
//			};
//			$('#assetPoolTable').bootstrapTable(assetPoolTableConfig);
//			$('#assetPoolTable_treaty').bootstrapTable(assetPoolTableConfig);

			// 收益采集 按钮点击事件
			$("#liquidAssetYieldSubmit").click(function() {
				if (!$('#liquidAssetYieldForm').validator('doSubmitCheck')) return
				$("#liquidAssetYieldForm").ajaxSubmit({
					type: "post", //提交方式  
					//dataType:"json", //数据类型'xml', 'script', or 'json'  
					url: config.api.cashToolPool.revenueSave,
					success: function(data) {
						$('#liquidAssetYieldForm').clearForm();
						$('#liquidAssetYieldModal').modal('hide');
						$('#dataTable').bootstrapTable('refresh');
					}
				});

			});

			function getQueryParams(val) {
				var form = document.searchForm
				$.extend(pageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象

				pageOptions.rows = val.limit
				pageOptions.page = parseInt(val.offset / val.limit) + 1
				return val
			}

			function getRevenueQueryParams(val) {

				//var form = document.searchForm
				//$.extend(revenuePageOptions, util.form.serializeJson(form)); //合并对象，修改第一个对象          

				revenuePageOptions.cashtoolOid = cashtool ? cashtool.oid : "";
				revenuePageOptions.rows = val.limit
				revenuePageOptions.page = parseInt(val.offset / val.limit) + 1

				return val
			}
			
			function getAssetPoolQueryParams(val) {
				assetPoolPageOptions.oid = cashtool ? cashtool.oid : "";
				assetPoolPageOptions.rows = val.limit
				assetPoolPageOptions.page = parseInt(val.offset / val.limit) + 1
				return val;
			}

			/**
			 * 格式化现金管理工具
			 * @param {Object} t
			 */
			function formatCashTool(t) {
				if (t) {
					var t2 = {};
					$.extend(t2, t); //合并对象，修改第一个对象
					t2.guarRatio = t2.guarRatio ? (t2.guarRatio * 100).toFixed(2) + '%' : ""; // 保本比例（%）
					t2.weeklyYield = t2.weeklyYield ? (t2.weeklyYield * 100).toFixed(2) + '' : ""; // 保本比例（%）
					t2.confirmDays = t2.confirmDays ? t2.confirmDays + '个工作日以内' : t2.confirmDays;
					
					return t2;
				}
				return t;
			}
			
			/**
			 * 格式化风险等级
			 * @param {Object} value
			 * @param {Object} row
			 */
			function formatRiskLevel(val) {
				if (val == 'R1') {
					return 'R1 - 谨慎型'
				} else if (val == 'R2') {
					return 'R2 - 稳健型'
				} else if (val == 'R3') {
					return 'R3 - 平衡型'
				} else if (val == 'R4') {
					return 'R4 - 进取型'
				} else if (val == 'R5'){
					return 'R5 - 激进型'
				}
			}
			
			/**
			 * 标的详情
			 */
			function toDetail(value, row) {
				http.post(config.api.liquidAsset.detailQuery, {
					data: {
						oid: row.oid
					},
					contentType: 'form'
				}, function(result) {
					var data = result;
					data.riskLevel = formatRiskLevel(data.riskLevel); // 格式化风险等级
					if(data.type == "CASHTOOLTYPE_01") {
						$$.detailAutoFix($('#liquidAssetDetailModal'), formatCashTool(data)); // 自动填充详情
						// 初始化数据表格
						$('#assetPoolTable').bootstrapTable('refresh');
						$('#liquidAssetDetailModal').modal('show');
					} else if(data.type == "CASHTOOLTYPE_02") {
						data.baseAmount = util.safeCalc(data.baseAmount, '/', 10000, 6);
						data.baseYield = util.safeCalc(data.baseYield, '*', 100, 2);
						data.yield = util.safeCalc(data.yield, '*', 100, 2);
						$$.detailAutoFix($('#liquidAssetDetailModal_treaty'), formatCashTool(data)); // 自动填充详情
					
						// 初始化数据表格
						$('#assetPoolTable_treaty').bootstrapTable('refresh');
						$('#liquidAssetDetailModal_treaty').modal('show');
					}
				})
			}
		}
	}
})