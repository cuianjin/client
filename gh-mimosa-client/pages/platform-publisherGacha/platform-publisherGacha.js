define([
  'http',
  'config',
  'util',
  'extension'
],
function (http, config, util, $$) {
  return {
    name: 'platform-publisherGacha',
    init: function () {
      var pageOptions1 = {
        page: 1,
        rows: 10,
        offset: 0,
        offsetCode: '',
        offsetDateBegin: '',
        offsetDateEnd: '',
        phone: '',
        realName: ''
      }
//  	var pageOptions2 = {
//      page: 1,
//      rows: 10,
//      offset: 0,
//      offsetCode: '',
//      offsetDateBegin: '',
//      offsetDateEnd: '',
//      corperate: '',
//      closeStatus: 'closed',
//      clearStatus: 'confirmed',
////      spvName: ''
//    }
      var orderPageOptions = {
        page: 1,
        rows: 10,
        offset: 0,
        orderCode: '',
        orderType: '',
        orderStatus: '',
        createTimeBegin: '',
        createTimeEnd: '',
        publisherOffsetOid: ''
      }

      // 记录正在操作的单条轧差数据
      var opGacha = null
      // 记录正在操作的单条待录入产品
      var opRow = null

      var orderTableConfig = {
        ajax: function (origin) {
          http.post(config.api.gacha.tradeorder, {
            data: orderPageOptions,
            contentType: 'form'
          }, function (rlt) {
            origin.success(rlt)
          })
        },
        pageNumber: orderPageOptions.number,
        pageSize: orderPageOptions.size,
        pagination: true,
        sidePagination: 'server',
        pageList: [10, 20, 30, 50, 100],
        queryParams: function (val) {
          var form  = document.orderSearchForm
          $.extend(orderPageOptions, util.form.serializeJson(form));
          orderPageOptions.rows = val.limit
          orderPageOptions.page = parseInt(val.offset / val.limit) + 1
          orderPageOptions.offset = val.offset
          return val
        }, 
        columns: [
          {
            halign: 'center',
            align: 'center',
            width: 30,
            formatter: function (val, row, index) {
              return index + 1 + orderPageOptions.offset
            }
          },
          {
            field: 'orderCode'
          },
          {
            field: 'orderAmount',
            class: 'currency',
            align: 'right'
          },
          {
            field: 'couponTypeDisp',
            align: 'right'
          },
          {
            field: 'couponAmount',
            align: 'right',
            class: 'currency'
          },
          {
            field: 'payAmount',
            align: 'right',
            class: 'currency'
          },
          {
              field: 'orderTypeDisp'
           },
          {
            field: 'orderStatusDisp',
          },
//        {
//            field: 'productCode'
//         },
          {
            field: 'productName'
          },
          {
            field: 'createTime',
            align: 'right',
            formatter: function (val) {
              return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
            }
          },
          {
            field: 'createManDisp'
          },
//        {
//        	field: 'investorClearStatusDisp',
//        	formatter: function (val) {
//            return val || '--'
//          }
//        },
//        {
//        	field: 'investorCloseStatusDisp',
//        	formatter: function (val) {
//            return val || '--'
//          }
//        },
          {
          	field: 'publisherClearStatusDisp',
          	formatter: function (val) {
              return val || '--'
            }
          },
          {
          	field: 'publisherConfirmStatusDisp',
          	formatter: function (val) {
              return val || '--'
            }
          },
          {
          	field: 'publisherCloseStatusDisp',
          	formatter: function (val) {
              return val || '--'
            }
          },
          {
						align: 'center',
						width: 200,
						formatter: function (val, row, index) {
								var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#orderTable').bootstrapTable('getData').length - 1,
									sub:[{
										text: '投资协议',
										type: 'button',
										class: 'item-invest',
										isRender: row.investContractAddr
									},{
										text: '服务协议',
										type: 'button',
										class: 'item-service',
										isRender: row.serviceContractAddr
									},{
										text: '支付日志',
										type: 'button',
										class: 'item-logs',
										isRender: row.orderCode
									}]
								}]
							return util.table.formatter.generateButton(buttons, 'orderTable');
						},
						events: {
							'click .item-invest': function (e, value, row) {
								window.open(location.href.substr(0,location.href.indexOf("mimosaui/index.html"))+row.investContractAddr)
							},
							'click .item-service': function (e, value, row) {
								window.open(location.href.substr(0,location.href.indexOf("mimosaui/index.html"))+row.serviceContractAddr)
							},
							'click .item-logs': function (e, value, row) {
								orderLogPageOptions.interfaceName = ''
								orderLogPageOptions.orderCode = row.orderCode
								document.orderLogSearchForm.interfaceName.value = ''
								$('#orderLogDataTable').bootstrapTable('destroy')
								$('#orderLogDataTable').bootstrapTable(orderLogTableConfig)
								$('#orderLogModal').modal('show')
							}
						}
					}
        ]
      }
    	
    	var tableConfig1 = {
        ajax: function (origin) {
          http.post(config.api.gacha.mng, {
            data: pageOptions1,
            contentType: 'form'
          }, function (rlt) {
            origin.success(rlt)
          })
        },
        pageNumber: pageOptions1.page,
        pageSize: pageOptions1.rows,
        pagination: true,
        sidePagination: 'server',
        pageList: [10, 20, 30, 50, 100],
        queryParams: function (val) {
          var form = document.searchForm1
          $.extend(pageOptions1, util.form.serializeJson(form));
          pageOptions1.rows = val.limit
          pageOptions1.page = parseInt(val.offset / val.limit) + 1
          pageOptions1.offset = val.offset
          return val
        },
        columns: [
          {
            halign: 'center',
            align: 'center',
            width: 30,
            formatter: function (val, row, index) {
              return index + 1 + pageOptions1.offset
            }
          },
          {
            field: 'spvOid'
          },
          {
            field: 'spvName'
          },
          {
            field: 'offsetCode',
            align: 'right'
          },
          {
            field: 'toCloseRedeemAmount',
            class: 'quantity',
            align: 'right'
          },
          {
            field: 'netPosition',
            class: 'currency',
            align: 'right'
          },
          {
            field: 'buyAmount',
            class: 'currency',
            align: 'right'
          },
          {
            field: 'redeemAmount',
            class: 'currency',
            align: 'right'
          },
          {
            field: 'createTime',
            align: 'right',
            formatter: function (val) {
            	return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
            }
          },
          {
          	field: 'clearStatusDisp',
          },
          {
          	field: 'confirmStatusDisp',
          },
          {
          	field: 'closeStatusDisp',
          },
          {
	      	  align: 'center',
	      	  width: 300,
	          formatter: function (val, row, index) {
	          		var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#dataTable1').bootstrapTable('getData').length - 1,
									sub:[{
		                text: '订单',
		                type: 'button',
		                class: 'order-detail'
		              }, 
		//            {
		//              text: '轧差明细',
		//              type: 'button',
		//              class: 'gacha-detail'
		//            }, 
		              {
		                text: "清算",
		                type: 'button',
		                class: 'item-clear',
		                isRender: row.clearStatus === "toClear" && row.clearTimeArr
		              }, {
		                text: "份额确认",
		                type: 'button',
		                class: 'item-volconfirm',
		                isRender: row.clearStatus === "cleared" && row.confirmStatus === "toConfirm" || row.confirmStatus === "confirmFailed"
		              }, {
		                text: "结算",
		                type: 'button',
		                class: 'item-close',
		                isRender: row.clearStatus === "cleared" && row.closeStatus === "toClose" || row.closeStatus === "closeFailed" || row.closeStatus === "closeSubmitFailed"
		              }, {
		                text: '产品轧差',
		                type: 'button',
		                class: 'item-input',
		                isRender:true
		              },{
		            	text: '兑付订单文件生成',
		                type: 'button',
		                class: 'item-generatefile',
		                isRender:config.customerButtonIsOpen=='true'?true:false
			           }]
								}]
              return util.table.formatter.generateButton(buttons, 'dataTable1');
	          },
            events: {
              'click .order-detail': function (e, value, row) {
              	orderPageOptions.publisherOffsetOid = row.offsetOid;
                $('#orderTable').bootstrapTable('destroy')
                $('#orderTable').bootstrapTable(orderTableConfig)
                $('#orderDetailModal').modal('show')
              },
//            'click .gacha-detail': function (e, value, row) {
//              var obj = {
//                offsetCode: row.offsetCode,
//                netPosition: util.safeCalc(row.netPosition, "/", 10000)+'万',
//                buyAmount: util.safeCalc(row.buyAmount, "/", 10000)+'万',
//                redeemAmount: util.safeCalc(row.redeemAmount, "/", 10000)+'万',
//                offsetStatusDisp: row.closeStatusDisp,
//                closeMan: row.closeMan || '--'
//              }
//              $$.detailAutoFix($('#gachaDetailArea'), obj)
//              $('#gachaDetailModal').modal('show')
//            },
              'click .item-clear': function (e, value, row) {
                $('#confirmContent').html('确定进行清算？')
                $$.confirm({
                  container: $('#confirmModal'),
                  trigger: this,
                  accept: function () {
                    http.post(util.buildQueryUrl(config.api.gacha.clear, {
                      offsetOid: row.offsetOid
                    }), {
                      contentType: 'form'
                    }, function (rlt) {
                      $("#dataTable1").bootstrapTable('refresh');
//                    $("#dataTable2").bootstrapTable('refresh');
                    })
                  }
                })
              },
              'click .item-volconfirm': function (e, value, row) {
                  $('#confirmContent').html('确定进行份额确认？')
                  $$.confirm({
                    container: $('#confirmModal'),
                    trigger: this,
                    accept: function () {
                      http.post(util.buildQueryUrl(config.api.gacha.volconfirm, {
                        offsetOid: row.offsetOid
                      }), {
                        contentType: 'form'
                      }, function (rlt) {
                        $("#dataTable1").bootstrapTable('refresh');
                        refresh();
                      })
                    }
                  })
                
            	
              },
              'click .item-close': function (e, value, row) {
                  $('#confirmContent').html('确定进行结算？')
                  $$.confirm({
                    container: $('#confirmModal'),
                    trigger: this,
                    accept: function () {
                      http.post(util.buildQueryUrl(config.api.gacha.close, {
                        offsetOid: row.offsetOid,
                        returnUrl: row.netPosition < 0 ? window.location.href : ''
                      }), {
                        contentType: 'application/json'
                      }, function (rlt) {
                        $("#dataTable1").bootstrapTable('refresh');
                        refresh();
                        if(rlt.retHtml){
                          var aa = window.open()
                          aa.document.write(rlt.retHtml)
                        }
                      })
                    }
                  })
              },
              'click .item-input': function (e, value, row) {
                opGacha = row
                loadProducts(http, config, row)
            	  $('#productModal').modal('show')
              },
              'click .item-generatefile': function (e, value, row) {
                  $('#confirmContent').html('生成兑付订单文件？')
                  $$.confirm({
                    container: $('#confirmModal'),
                    trigger: this,
                    accept: function () {
                      http.post(util.buildQueryUrl(config.api.generateOrderFile, {
                        jobId:'order',
                    	offsetOid: row.offsetOid,
                        returnUrl: row.netPosition < 0 ? window.location.href : ''
                      }), {
                        contentType: 'application/json'
                      }, function (rlt) {
                        refresh();
                        if(rlt.retHtml){
                          var aa = window.open()
                          aa.document.write(rlt.retHtml)
                        }
                      })
                    }
                  })
              },
            }
	        }
        ]
      }

//  	var tableConfig2 = {
//      ajax: function (origin) {
//        http.post(config.api.gacha.mng, {
//          data: pageOptions2,
//          contentType: 'form'
//        }, function (rlt) {
//          origin.success(rlt)
//        })
//      },
//      pageNumber: pageOptions2.number,
//      pageSize: pageOptions2.size,
//      pagination: true,
//      sidePagination: 'server',
//      pageList: [10, 20, 30, 50, 100],
//      queryParams: getQueryParams2,
//      columns: [
//        {
//          width: 30,
//          align: 'center',
//          formatter: function (val, row, index) {
//            return index + 1 + pageOptions2.offset
//          }
//        },
//        {
//          field: 'spvName'
//        },
//        {
//          field: 'offsetCode'
//        },
//        {
//          field: 'netPosition'
//        },
//        {
//          field: 'buyAmount'
//        },
//        {
//          field: 'redeemAmount'
//        },
//        {
//          field: 'createTime',
//          formatter: function (val) {
//          	return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
//          }
//        },
//        {
//          formatter: function (val, row) {
//          	return row.clearStatusDisp + ',' + row.confirmStatusDisp + ',' + row.closeStatusDisp
//          }
//        },
//        {
//	      	  align: 'center',
//	      	  width: 300,
//          formatter: function () {
//            var buttons = [{
//              text: '订单',
//              type: 'button',
//              class: 'order-detail'
//            }, 
////            {
////              text: '轧差明细',
////              type: 'button',
////              class: 'gacha-detail'
////            }, 
//            {
//              text: '费用记录',
//              type: 'button',
//              class: 'item-input'
//            }]
//            return util.table.formatter.generateButton(buttons, 'dataTable2');
//          },
//          events: {
//          	'click .order-detail': function (e, value, row) {
//                	console.log(row.offsetOid);
//                	orderPageOptions.publisherOffsetOid = row.offsetOid;
//                  $('#orderTable').bootstrapTable('destroy')
//                  $('#orderTable').bootstrapTable(orderTableConfig)
//                  $('#orderDetailModal').modal('show')
//                },
////                'click .gacha-detail': function (e, value, row) {
////                  var obj = {
////                    offsetCode: row.offsetCode,
////                    netPosition: util.safeCalc(row.netPosition, "/", 10000)+'万',
////                    buyAmount: util.safeCalc(row.buyAmount, "/", 10000)+'万',
////                    redeemAmount: util.safeCalc(row.redeemAmount, "/", 10000)+'万',
////                    clearStatusDisp: row.clearStatusDisp,
////                    closeMan: row.closeMan
////                  }
////                  $$.detailAutoFix($('#gachaDetailArea'), obj)
////                  $('#gachaDetailModal').modal('show')
////                },
//                'click .item-input': function (e, value, row) {
//                    opGacha = row
//                    loadProducts(http, config, row)
//                	  $('#productModal').modal('show')
//                  }
//            }
//	        }
//      ]
//    }
    	
      // 待录入产品表格配置
    	var productTableConfig = {
        columns: [
          {
            halign: 'left',
            align: 'center',
            width: 30,
            formatter: function (val, row, index) {
              return index + 1
            }
          },
          {
            field: 'productName'
          },
          {
            field: 'busTime',
//          formatter: function (val) {
//            return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
//          }
          },
          {
            field: 'investAmount',
            class: 'currency'
          },
          {
            field: 'redeemAmount',
            class: 'currency'
          },
          {
              field: 'netPosition',
              class: 'currency'
          },
//        {
//          align: 'center',
//          width: 200,
//          formatter: function (val, row, index) {
//            	var buttons = [{
//					text: '操作',
//					type: 'buttonGroup',
////					isCloseBottom: index >= $('#productTable').bootstrapTable('getData').length - 1,
//					sub:[{
//		                text: '费用录入',
//		                type: 'button',
//		                class: 'item-input'
//		              },{
//		                  text: '费用明细',
//		                  type: 'button',
//		                  class: 'item-input-read'
//		                }]
//					}]
//            return util.table.formatter.generateButton(buttons, 'productTable');
//          },
//          events: {
//            'click .item-input': function (e, value, row) {
//              opRow = row
//              var form = document.inputForm
//              util.form.reset($(form))
//              $$.formAutoFix($(form), row)
//              http.get(config.api.gacha.findSPVAndCustomer, function (rlt) {
//                var getspv = $(form.getspv).empty()
//                rlt.spvlist.forEach(function (item) {
//                  getspv.append('<option value="' + item.oid + '">' + item.name + '</option>')
//                })
//                getspv.off().on('change', function () {
//                  var val = this.value
//                  rlt.spvlist.forEach(function (item) {
//                    if (item.oid === val) {
//                      $(form.accountType).val(item.accountType)
//                      $(form.accountInfo).val(item.accountNo)
//                      $(form.customerId).val(rlt.customer.customer_id)
//                      $(form.customerInfo).val(rlt.customer.customer_account)
//                    }
//                  })
//                }).change()
//              })
//              $('#inputModal').modal('show')
//            },
//            'click .item-input-read': function (e, value, row) {
//             	  loadProductOffsetFee(http, config, row)
//          	    $('#productOffsetFee').modal('show')
//            },
//          }
//        }
        ]
      }
    	
    	// 轧差费用明细表格配置
    	var productOffsetFeeTableConfig = {
        columns: [
          {
            halign: 'left',
            align: 'center',
            width: 30,
            formatter: function (val, row, index) {
              return index + 1
            }
          },
          {
            field: 'productName'
          },
          {
            field: 'busDate'
//          formatter: function (val) {
//            return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD')
//          }
          },
          {
            field: 'notifyType',
            formatter: function (val) {
            	if (val == 'offsetPay') {
            		return "轧差支付"
            	}
            	if (val == 'offsetPayCouFee') {
            		return "手续费"
            	}
            	if (val == 'offsetCollect') {
            		return "轧差收款"
            	}
            	return ""
	          }
          },
          {
            field: 'costFee',
            class: 'currency'
          },
          {
            field: 'notifyStatus',
            formatter: function(val) {
					if (val == 'toConfirm') {
						return "待确认"
					}
					if (val == 'confirmed') {
						return "已确认"
					}
					return ""
				}
          }
        ]
      }
    	
    	var orderLogPageOptions = {
			number: 1,
			size: 10,
			offset: 0,
			interfaceName: '',
			orderCode: ''
		}
		
		var orderLogTableConfig = {
			ajax: function(origin) {
				http.post(
					config.api.settlementLogmng, {
						data: {
							page: orderLogPageOptions.number,
							rows: orderLogPageOptions.size,
							interfaceName: orderLogPageOptions.interfaceName,
							orderCode: orderLogPageOptions.orderCode
						},
						contentType: 'form'
					},
					function(rlt) {
						origin.success(rlt)
					}
				)
			},
			pageNumber: orderLogPageOptions.number,
			pageSize: orderLogPageOptions.size,
			pagination: true,
			sidePagination: 'server',
			pageList: [10, 20, 30, 50, 100],
			queryParams: function(val) {
				var form = document.orderLogSearchForm
				orderLogPageOptions.size = val.limit
				orderLogPageOptions.number = parseInt(val.offset / val.limit) + 1
				orderLogPageOptions.offset = val.offset
				orderLogPageOptions.interfaceName = form.interfaceName.value.trim()
				return val
			},
			onLoadSuccess: function() {},
			onClickCell: function (field, value, row, $element) {
				switch (field) {
					case 'interfaceName':
						$$.detailAutoFix($('#interfaceDetailModal'), row);
						// errorMessage错误有时会包含html标签，影响整体样式显示
						var temp = document.createElement("div");
						temp.innerHTML = row.errorMessage;
						$('#errorMessage').html(temp.innerText);
						$('#interfaceDetailModal').modal('show');
						break
				}
			},
			columns: [{
				width: 30,
				align: 'center',
				formatter: function(val, row, index) {
					return index + 1 + orderLogPageOptions.offset
				}
			}, {
				field: 'interfaceName',
				class:"table_title_detail"
			}, {
				field: 'orderCode',
				class: 'align-right'
			}, {
				field: 'ipayNo',
				class: 'align-right'
			}, {
				field: 'handleTypeDisp',
				class: 'align-right'
			}, {
				field: 'errorCode',
				class: 'align-right'
			}, {
				field: 'sendedTimes',
				class: 'align-right'
			}, {
				field: 'limitSendTimes',
				class: 'align-right'
			}, {
				field: 'nextNotifyTime',
				class: 'align-right'
			}, {
				field: 'createTime',
				class: 'align-right'
			}, {
				field: 'updateTime',
				class: 'align-right'
			}]
		}
    	
      // 各项表格初始化
      $("#dataTable1").bootstrapTable(tableConfig1)
//    $("#dataTable2").bootstrapTable(tableConfig2)
      $('#productTable').bootstrapTable(productTableConfig)
      $('#productOffsetFeeTable').bootstrapTable(productOffsetFeeTableConfig)
    	
      // 表格查询初始化
      $$.searchInit($('#searchForm1'), $('#dataTable1'))
//    $$.searchInit($('#searchForm2'), $('#dataTable2'))
      $$.searchInit($('#orderSearchForm'), $('#orderTable'))
      $$.searchInit($('#orderLogSearchForm'), $('#orderLogDataTable'));

      // 验证初始化
      util.form.validator.init($('#inputForm'))

      // 手续费录入弹窗确定按钮
      $('#doInput').on('click', function () {
        var form = document.inputForm
        if (!$(form).validator('doSubmitCheck')) return
        var formdata = $.extend({}, opRow, util.form.serializeJson(form))
        http.post(config.api.gacha.offsetmoney, {
          data: JSON.stringify({ offsetMoneyList: [formdata] }),
        }, function (result) {
          loadProducts(http, config, opGacha)
          $('#inputModal').modal('hide')
        })
      })

      function loadProducts (http, config, row) {
       http.post(config.api.gacha.findsoid, {
          data: {
            offsetOid : row.offsetOid
          },
          contentType: 'form'
        }, function (rlt) {
          $('#productTable').bootstrapTable('load', rlt.rows.map(function (item) {
            item.money = item.money ||0
            item.couFee = item.couFee || 0
            item.lexinFee = item.lexinFee || 0
            item.lexinCouFee = item.lexinCouFee || 0
            item.actualAmount = item.actualAmount || 0
            item.busDate = row.offsetDate
            item.busTime = row.offsetDate
            return item
          }))
        })
      }
      
      function loadProductOffsetFee(http, config, row) {
      	console.log(row);
        http.post(config.api.gacha.offsetFee, {
          data: {
            productOid : row.productOid,//'0119863',
           busDay : row.busTime
          },
          contentType: 'form'
        }, function (rlt) {
          $('#productOffsetFeeTable').bootstrapTable('load', rlt.rows.map(function (item) {
          	item.productName = row.productName;
          	return item;
          }))
        })
      }

//  	function getQueryParams2 (val) {
//	        var form = document.searchForm2
//	        pageOptions2.size = val.limit
//	        pageOptions2.number = parseInt(val.offset / val.limit) + 1
//	        pageOptions2.offset = val.offset
//	        pageOptions2.offsetCode = form.offsetCode.value
//	        pageOptions2.offsetDateBegin = form.offsetDateBegin.value
//	        pageOptions2.offsetDateEnd = form.offsetDateEnd.value
////	        pageOptions2.spvName = form.spvName.value
//	        return val
//    }
    	
    }
  }
})
		function refresh() {
//  		window.setTimeout("$(\"#dataTable2\").bootstrapTable('refresh');", 2000);
    		window.setTimeout("$(\"#dataTable1\").bootstrapTable('refresh');", 2000);
    	}
