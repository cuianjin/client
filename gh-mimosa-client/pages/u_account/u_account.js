/**
 * 投资者账户管理
 */
define([
	'http',
	'config',
	'util',
	'extension'
],
function (http, config, util,$$) {
	return {
		name: 'u_account',
		init: function () {
			var pageOptions1 = {
				number: 1,
				size: 10,
				offset: 0,
				phoneNum: '',
				owner: '',
				reqTimeBegin: '',
				reqTimeEnd: ''
			}
			var pageOptions2 = {
				number: 1,
				size: 10,
				offset: 0,
				phoneNum: '',
				owner: '',
				reqTimeBegin: '',
				reqTimeEnd: ''
			}
			var tableConfig1 = {
				ajax: function (origin) {
					http.post(config.api.uaccountQuery, {
						data: {
							page: pageOptions1.number,
							rows: pageOptions1.size,
							phoneNum: pageOptions1.phoneNum,
							status: 'normal',
							owner: pageOptions1.owner,
							reqTimeBegin: pageOptions1.reqTimeBegin,
							reqTimeEnd: pageOptions1.reqTimeEnd
						},
						contentType: 'form'
					}, function (rlt) {
						origin.success(rlt)
					})
				},
				pageNumber: pageOptions1.number,
				pageSize: pageOptions1.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				queryParams: getQueryParams1,
				onClickCell: function (field, value, row, $element) {
				  switch (field) {
		        case 'phoneNum':
		        	queryInfo(value,row)
		        	break
				  }
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
						field: 'phoneNum',
						class: 'table_title_detail m_hide',
						formatter: function(val){
							return val || '--'
						}
					},
					{
						field: 'realName',
						formatter: function(val){
							return val || '--'
						}
					},
					{
						field: 'statusDisp'
					},
					{
						field: 'ownerDisp'
					},
					{
						field: 'balance',
						class: 'currency align-right'
					},
					{
						field: 'totalInvestAmount',
						class: 'currency align-right'
					},
					{
						field: 'totalIncomeAmount',
						class: 'currency align-right'
					},
					{
						field: 'createTime',
						class: 'align-right',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						align: 'center',
						width: 250,
						formatter: function (val, row ,index) {
							var buttons = [{
								text: '操作',
								type: 'buttonGroup',
//								isCloseBottom: index >= $('#dataTable1').bootstrapTable('getData').length - 1,
								sub:[{
									text: '锁定',
									type: 'button',
									class: 'item-lock',
									isRender: true
								},{
									text: '登录解锁',
									type: 'button',
									class: 'item-cannelloginlock',
									isRender: true
								},{
									text: '换手机号',
									type: 'button',
									class: 'item-changeacc',
									isRender: true
								}]
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable1');
						},
						events: {
							'click .item-lock': function (e, value, row) {
								document.getElementById('lockOrUnlockConfirm').getElementsByTagName('p')[0].innerHTML = '确定要锁定['+row.realName+']吗？'
								$$.confirm({
									container: $('#lockOrUnlockConfirm'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.uaccountLock, {
											uoid: row.investorOid,
											islock: 'is'
										}), {
											contentType: 'form',
										}, function (result) {
											$('#dataTable1').bootstrapTable('refresh')
											$('#dataTable2').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-cannelloginlock': function (e, value, row) {
								document.getElementById('lockOrUnlockConfirm').getElementsByTagName('p')[0].innerHTML = '确定要解除['+row.realName+']登录锁定吗？'
								$$.confirm({
									container: $('#lockOrUnlockConfirm'),
									trigger: this,
									accept: function () {
										http.post(config.api.cannelLoginLock + "?investorOid=" + row.investorOid, {
											data: {
											},
											contentType: 'form'
										}, function (rlt) {
											toastr.success("解锁登录锁定成功！", '提示信息', {
											    timeOut: 3000
											})
										})
										
									}
								})
							},
							'click .item-changeacc': function (e, value, row) {
								document.getElementById('lockOrUnlockConfirm').getElementsByTagName('p')[0].innerHTML = '确定要更换['+row.realName+']手机号吗？'
								$$.confirm({
									container: $('#lockOrUnlockConfirm'),
									trigger: this,
									accept: function () {
										var form = document.changeAccForm
										$(form).validator('destroy')
										util.form.validator.init($(form));
										util.form.reset($('#changeAccForm'));
										$("#changeAccOid").val(row.investorOid);
										$('#changeAccModal').modal('show');
									}
								})
							},
							'click .item-detail': function (e, value, row) {
//								window.location.href = window.location.href.substr(0,window.location.href.indexOf("#")) +"#u_accountdetail?uoid=" + row.oid+"&userOid="+row.userOid
//								location.reload()
								
								
							}
						}
					}
				]
			}
			
			var tableConfig2 = {
				ajax: function (origin) {
					http.post(config.api.uaccountQuery, {
						data: {
							page: pageOptions2.number,
							rows: pageOptions2.size,
							phoneNum: pageOptions2.phoneNum,
							status: 'forbidden',
							owner: pageOptions2.owner,
							reqTimeBegin: pageOptions2.reqTimeBegin,
							reqTimeEnd: pageOptions2.reqTimeEnd
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
				onClickCell: function (field, value, row, $element) {
				  switch (field) {
		        case 'phoneNum':
		        	queryInfo(value,row)
		        	break
				  }
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
						field: 'phoneNum',
						class: 'table_title_detail',
						align: 'right',
						formatter: function(val){
							return val || '--'
						}
					},
					{
						field: 'realName',
						formatter: function(val){
							return val || '--'
						}
					},
					{
						field: 'statusDisp'
					},
					{
						field: 'ownerDisp'
					},
					{
						field: 'balance',
						class: 'currency',
						align: 'right'
					},
					{
						field: 'totalInvestAmount',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'totalIncomeAmount',
						align: 'right',
						class: 'currency'
					},
					{
						field: 'createTime',
						align: 'right',
						formatter: function (val) {
							return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
						}
					},
					{
						align: 'center',
						width: 120,
						formatter: function (val, row) {
							var buttons = [{
								text: '解锁',
								type: 'button',
								class: 'item-unlock',
								isRender: true
							}]
							return util.table.formatter.generateButton(buttons, 'dataTable2');
						},
						events: {
							'click .item-unlock': function (e, value, row) {
								document.getElementById('lockOrUnlockConfirm').getElementsByTagName('p')[0].innerHTML = '确定要解锁['+row.realName+']吗？'
								$$.confirm({
									container: $('#lockOrUnlockConfirm'),
									trigger: this,
									accept: function () {
										http.post(util.buildQueryUrl(config.api.uaccountLock, {
											uoid: row.investorOid,
											islock: 'not'
										}), {
											contentType: 'form',
										}, function (result) {
											$('#dataTable1').bootstrapTable('refresh')
											$('#dataTable2').bootstrapTable('refresh')
										})
									}
								})
							},
							'click .item-detail': function (e, value, row) {
//								window.location.href = window.location.href.substr(0,window.location.href.indexOf("#")) +"#u_accountdetail?uoid=" + row.oid+"&userOid="+row.userOid
//								location.reload()
								
								
							}
						}
					}
				]
			}
			
			$("#dataTable1").bootstrapTable(tableConfig1)
			$("#dataTable2").bootstrapTable(tableConfig2)
			
			$$.searchInit($('#searchForm1'), $('#dataTable1'))
			$$.searchInit($('#searchForm2'), $('#dataTable2'))
			
			util.form.validator.init($('#changeAccForm'))
			
			function getQueryParams1 (val) {
				var form = document.searchForm1
				pageOptions1.size = val.limit
				pageOptions1.number = parseInt(val.offset / val.limit) + 1
				pageOptions1.offset = val.offset
				pageOptions1.phoneNum = form.phoneNum.value
				pageOptions1.owner = form.owner.value
				pageOptions1.reqTimeBegin = form.reqTimeBegin.value
				pageOptions1.reqTimeEnd = form.reqTimeEnd.value
				return val
			}
			
			function getQueryParams2 (val) {
				var form = document.searchForm2
				pageOptions2.size = val.limit
				pageOptions2.number = parseInt(val.offset / val.limit) + 1
				pageOptions2.offset = val.offset
				pageOptions2.phoneNum = form.phoneNum.value
				pageOptions2.owner = form.owner.value
				pageOptions2.reqTimeBegin = form.reqTimeBegin.value
				pageOptions2.reqTimeEnd = form.reqTimeEnd.value
				return val
			}
			
			// 修改注册手机号
			$('#changeAccBtn').on('click', function() {
				var form = document.changeAccForm
				if (!$(form).validator('doSubmitCheck')) return
				
				var oldpn = form.oldpn.value;
				var newpn = form.newpn.value;
				
				http.post(config.api.changeacc + "?investorOid=" + $("#changeAccOid").val() + '&oldpn=' + oldpn + '&newpn=' + newpn, {
					data: {
					},
					contentType: 'form'
				}, function (res) {
					$('#changeAccModal').modal('hide')
					$('#dataTable1').bootstrapTable('refresh')
					$("#changeAccOid").val('');
				})
			})
			function queryInfo(value,row){
				util.nav.dispatch('u_accountdetail', 'investorOid=' + row.investorOid)
			}
		}
	}
})
