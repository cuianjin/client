/**
 * 备用金管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util, $$) {
	return {
		name: 'reserveMoney',
		init: function () {
			var operating = {
				operateType: ''
			}
			var pageOptions = {
				number: 1,
				size: 10,
				offset: 0,
				orderType: '',
				orderCode: '',
				createTimeBegin: '',
				createTimeEnd: ''
			}
			var pageOptions2 = {
				number: 1,
				size: 10,
				offset: 0,
				createTimeBegin: '',
				createTimeEnd: ''
			}
			$("#photo img").each(function(i, e){
				switch(i){
					case 0 : $(e).attr("src", config.api.resmoneyPhoto+"/assets/images/arrow.png");break
					case 1 : case 2 : case 3 : $(e).attr("src", config.api.resmoneyPhoto+"/assets/images/arrow"+i+".png");break
					case 4 : case 5 : $(e).attr("src", config.api.resmoneyPhoto+"/assets/images/arrow"+(i-2)+".png");break
					default : break;
				}
			})
			getData()
			getBaseaccountData()
			getSuperaccountData()
			var tableConfig = {
				ajax: function (origin) {
					http.post(config.api.resmoneyMng, {
						data: {
							page: pageOptions.number,
							rows: pageOptions.size,
							orderType: pageOptions.orderType,
							orderCode: pageOptions.orderCode,
							createTimeBegin: pageOptions.createTimeBegin,
							createTimeEnd: pageOptions.createTimeEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions.number,
				pageSize: pageOptions.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams,
				columns: [
					{
						halign: 'left',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions.offset
						}
					},
					{
						field: 'orderCode'
					},
					{
						field: 'createTime',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'orderAmount',
						class: 'currency'
					},
					{
						field: 'orderTypeDisp'
					},
					{
						field: 'relatedAccDisp'
					},
					{
						field: 'orderStatusDisp'
					}
				]
			}
			
			var tableConfig2 = {
				ajax: function (origin) {
					http.post(config.api.superaccMng, {
						data: {
							page: pageOptions2.number,
							rows: pageOptions2.size,
							createTimeBegin: pageOptions2.createTimeBegin,
							createTimeEnd: pageOptions2.createTimeEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions2.number,
				pageSize: pageOptions2.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams2,
				columns: [
					{
						halign: 'left',
						align: 'center',
						width: 30,
						formatter: function (val, row, index) {
							return index + 1 + pageOptions2.offset
						}
					},
					{
						field: 'orderCode'
					},
					{
						field: 'createTime',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						field: 'orderAmount',
						class: 'currency'
					},
					{
						field: 'orderTypeDisp'
					},
					{
						field: 'relatedAcc'
					},
					{
						field: 'orderStatusDisp'
					}
				]
			}
			
			$("#dataTable").bootstrapTable(tableConfig)
			$("#dataTable2").bootstrapTable(tableConfig2)
			
			$$.searchInit($('#searchForm'), $('#dataTable'))
			$$.searchInit($('#searchForm2'), $('#dataTable2'))
//			util.form.validator.init($("#collectAndPayForm"))
			
			$('#paysuper').on('click', function () {
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'paysuper'
				$('#collectAndPayForm').clearForm()
				$('#collectAndPayForm').find('input[name=moneyVolume]').attr('placeholder','请输入还款金额')
				var form = document.collectAndPayForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				$('#collectAndPayModal')
				.modal('show')
				.find('.modal-title').html('超级用户还款')
			})
			
			$('#collectsuper').on('click', function () {
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'collectsuper'
				$('#collectAndPayForm').clearForm()
				$('#collectAndPayForm').find('input[name=moneyVolume]').attr('placeholder','请输入借款金额')
				var form = document.collectAndPayForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				$('#collectAndPayModal')
				.modal('show')
				.find('.modal-title').html('超级用户借款')
			})
			
			$('#paybasic').on('click', function () {
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'paybasic'
				$('#collectAndPayForm').clearForm()
				$('#collectAndPayForm').find('input[name=moneyVolume]').attr('placeholder','请输入还款金额')
				var form = document.collectAndPayForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				$('#collectAndPayModal')
				.modal('show')
				.find('.modal-title').html('基本用户还款')
			})
			
			$('#collectbasic').on('click', function () {
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'collectbasic'
				$('#collectAndPayForm').clearForm()
				$('#collectAndPayForm').find('input[name=moneyVolume]').attr('placeholder','请输入借款金额')
				var form = document.collectAndPayForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				$('#collectAndPayModal')
				.modal('show')
				.find('.modal-title').html('基本用户借款')
			})
			
			$('#paysb').on('click', function () {
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'paysb'
				$('#collectAndPayForm').clearForm()
				$('#collectAndPayForm').find('input[name=moneyVolume]').attr('placeholder','请输入还款金额')
				var form = document.collectAndPayForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				$('#collectAndPayModal')
				.modal('show')
				.find('.modal-title').html('超级户还款给基本户')
			})
			
			$('#collectbs').on('click', function () {
				$('#refreshDiv').removeClass('overlay');
				$('#refreshI').removeClass('fa fa-refresh fa-spin');
				operating.operateType = 'collectbs'
				$('#collectAndPayForm').clearForm()
				$('#collectAndPayForm').find('input[name=moneyVolume]').attr('placeholder','请输入借款金额')
				var form = document.collectAndPayForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
				$('#collectAndPayModal')
				.modal('show')
				.find('.modal-title').html('基本户借款给超级户')
			})
			
			$('#collectAndPaySubmit').on('click', function () {
				if (!$('#collectAndPayForm').validator('doSubmitCheck')) return
				$('#refreshDiv').addClass('overlay');
				$('#refreshI').addClass('fa fa-refresh fa-spin');
				document.collectAndPayForm.amount.value = document.collectAndPayForm.moneyVolume.value
				var url = "";
				switch(operating.operateType){
					case "paysuper" : url = config.api.paysuper;break
					case "collectsuper" : url = config.api.collectsuper;break
					case "paybasic" : url = config.api.paybasic;break
					case "collectbasic" : url = config.api.collectbasic;break
					case "paysb" : url = config.api.paysb;break
					case "collectbs" : url = config.api.collectbs;break
					default : break
				}
				$('#collectAndPayForm').ajaxSubmit({
					url: url,
					success: function (result) {
						if(result.errorCode == 0){
							setTimeout(function () {
								getData()
								getBaseaccountData()
								getSuperaccountData()
								$('#collectAndPayModal').modal('hide')
								$('#dataTable').bootstrapTable('refresh')
								$('#dataTable2').bootstrapTable('refresh')
							},2000)
						}else{
							errorHandle(result)
							$('#refreshDiv').removeClass('overlay');
							$('#refreshI').removeClass('fa fa-refresh fa-spin');
						}
					}
				})
			})
			
			$("#refresh").on('click', function(){
				getData()
				getBaseaccountData()
				getSuperaccountData()
			})
			
			$("#superDetail").on('click', function(){
				util.nav.dispatch('u_accountdetail', 'uoid=superaccount&userOid=superaccount')
			})
			
			function getData () {
				http.post(config.api.resmoneyDeta, {
					contentType: 'form',
				}, function (result) {
					$('#lastBorrowTime').html(result.lastBorrowTime ? '最近借款时间：<div><span style="font-size: x-large;">'+util.table.formatter.timestampToDate(result.lastBorrowTime, 'YYYY-MM-DD HH:mm:ss')+'</span></div>' : '')
					$('#lastReturnTime').html(result.lastReturnTime ? '最近还款时间：<div><span style="font-size: x-large;">'+util.table.formatter.timestampToDate(result.lastReturnTime, 'YYYY-MM-DD HH:mm:ss')+'</span></div>' : '')
					$("#superAccBorrowAmount").html(util.safeCalc(result.superAccBorrowAmount, "/", 10000))
					$("#basicAccBorrowAmount").html(util.safeCalc(result.basicAccBorrowAmount, "/", 10000))
					$("#balance").html(util.safeCalc(result.balance, "/", 10000))
				})
			}
			
			function getBaseaccountData () {
				http.post(config.api.baseaccountDeta, {
					contentType: 'form',
				}, function (result) {
					$("#basicBalance").html(util.safeCalc(result.balance, "/", 10000))
					$("#sbBorrowAmount").html(util.safeCalc(result.superAccBorrowAmount, "/", 10000))
				})
			}
			
			function getSuperaccountData () {
				http.post(config.api.placcountSman, {
					contentType: 'form',
				}, function (result) {
					$("#superBalance").html(util.safeCalc(result.balance, "/", 10000))
				})
			}
			
			function getQueryParams (val) {
				var form = document.searchForm
				pageOptions.size = val.limit
				pageOptions.number = parseInt(val.offset / val.limit) + 1
				pageOptions.offset = val.offset
				pageOptions.orderType = form.orderType.value
				pageOptions.orderCode = form.orderCode.value
				pageOptions.createTimeBegin = form.createTimeBegin.value
				pageOptions.createTimeEnd = form.createTimeEnd.value
				return val
			}
			
			function getQueryParams2 (val) {
				var form = document.searchForm2
				pageOptions2.size = val.limit
				pageOptions2.number = parseInt(val.offset / val.limit) + 1
				pageOptions2.offset = val.offset
				pageOptions2.createTimeBegin = form.createTimeBegin.value
				pageOptions2.createTimeEnd = form.createTimeEnd.value
				return val
			}
		}
	}
})
