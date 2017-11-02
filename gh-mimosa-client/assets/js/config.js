/**
 * 配置项，提供全局使用各项配置
 * amd模块，使用requirejs载入
 */
define(function() {
	// this.host = 'http://10.112.88.183'
	// this.host = 'http://api.guohuaigroup.com'
	this.host = ''
	this.system = 'MIMOSA'
	this.hostext = 'http://115.28.22.58'
	this.dandelionAccessCKEY = '7f2461321f224e8b8706da228fb31838'
	this.customerButtonIsOpen='false'
	this.webprefix = 'mimosa';
	
	var result = {


		host: this.host, // 系统地址
		system: this.system, // 系统代号，做用户权限与登录使用
		hostext: this.hostext,
		customerButtonIsOpen:this.customerButtonIsOpen,
		webprefix: this.webprefix,
		/**
		 * api 接口提供与服务器异步交互地址
		 * 
		 */
		api: {
			login: this.host + '/operate/admin/login', // 登录服务
			logout: this.host + '/operate/admin/logout', // 登出服务
			userInfo: this.host + '/operate/admin/info', // 登录用户信息服务
			resetPwd: this.host + '/operate/admin/reset/password/form', // 修改密码
			genPwd: this.host + '/operate/admin/reset/password/gen', // 重设密码
			adminSearch: this.host + '/operate/admin/search', // 管理员列表
			cannelLoginLock: this.host + '/mimosa/boot/investor/baseaccount/cancelloginlock', //登录解锁
			bankinfo: this.host + '/mimosa/boot/investor/bank/getbankinfo', //银行卡
			removebank: this.host + '/mimosa/boot/investor/bank/removebank', //解绑银行卡
			changeacc: this.host + '/mimosa/boot/investor/baseaccount/changeacc', //修改注册手机号
			allacc: this.host + '/mimosa/boot/publisher/loginacc/allacc', // 过滤管理员列表
			allaccmodify: this.host + '/mimosa/boot/publisher/loginacc/allaccmodify', // 过滤发行人对应管理员
			uploginacc: this.host + '/mimosa/boot/publisher/loginacc/uploginacc', // 更新发行人对应管理员
			yup: this.host + '/yup', // 文件上传服务
			dictList: this.host + '/mimosa/dict/list', // 枚举值获取接口
			sms: {
				getvc: this.host + '/mimosa/boot/bfsms/getvc',
			},
			partner:{
				partnerList: this.host + '/cms/boot/partner/query', // 合作伙伴-获取列表
				partnerSortList: this.host + '/cms/boot/partner/sortQuery', // 合作伙伴-获取排序好的列表
				partnerAdd: this.host + '/cms/boot/partner/add', // 合作伙伴-新增
				partnerUpdate: this.host + '/cms/boot/partner/update', // 合作伙伴-修改
				partnerDelete: this.host + '/cms/boot/partner/delete', // 合作伙伴-删除
				partnerActive: this.host + '/cms/boot/partner/active', // 合作伙伴-批量上下架
				partnerDealApprove: this.host + '/cms/boot/partner/dealapprove', // 合作伙伴-审批
			},
			tradeCalendar: {
				query: this.host + '/mimosa/calendar/queryPages',	//交易日历分页
				delete: this.host + '/mimosa/calendar/delete',		//交易日历删除
				add: this.host + '/mimosa/calendar/add',			//交易日历添加修改
			},
			bankCard: {
				query: this.host + '/cms/boot/bankCard/query',	// 银行卡列表
				add: this.host + '/cms/boot/bankCard/add',	// 银行卡添加
				update: this.host + '/cms/boot/bankCard/update',	// 银行卡修改
				delete: this.host + '/cms/boot/bankCard/delete',	// 银行卡删除
				dealapprove: this.host + '/cms/boot/bankCard/dealapprove',	// 银行卡审核
			},
			switchcraft: {
				query: this.host + '/mimosa/boot/switch/query', // 系统级开关分页
				add: this.host + '/mimosa/boot/switch/add', // 添加系统级开关
				update: this.host + '/mimosa/boot/switch/update', // 系统级开关审核
				dealapprove: this.host + '/mimosa/boot/switch/dealapprove', // 系统级开关审核
				delete: this.host + '/mimosa/boot/switch/delete', // 删除系统级开关
				disable: this.host + '/mimosa/boot/switch/disable', // 系统级开关禁用
				enable: this.host + '/mimosa/boot/switch/enable', // 系统级开关启用
				addwhite: this.host + '/mimosa/boot/switch/addwhite', // 添加系统级白名单 
				addblack: this.host + '/mimosa/boot/switch/addblack', // 添加系统级黑名单 
				whitedisable: this.host + '/mimosa/boot/switch/whitedisable', // 系统级开关禁用
				whiteenable: this.host + '/mimosa/boot/switch/whiteenable', // 系统白名单启用
				blackenable: this.host + '/mimosa/boot/switch/blackenable', // 系统黑名单启用
				querywhite: this.host + '/mimosa/boot/switch/querywhite', // 系统级开关白名单分页
				queryblack: this.host + '/mimosa/boot/switch/queryblack', // 系统级开关黑名单分页
				delwhite: this.host + '/mimosa/boot/switch/delwhite', // 系统级开关白名单删除
				delblack: this.host + '/mimosa/boot/switch/delblack', // 系统级开关白名单删除
			},
			mail: {
				queryPage: this.host + '/cms/boot/mail/queryPage', // 站内信分页列表
				add: this.host + '/cms/boot/mail/add', // 添加站内信
				approve: this.host + '/cms/boot/mail/approve', // 站内信审核
				delete: this.host + '/cms/boot/mail/delete', // 删除站内信
			},
			ope: {
				noCard: {
					list: this.host + '/mimosa/boot/ope/nocard/list', // 未绑卡列表
					detail: this.host + '/mimosa/boot/ope/nocard/detail', // 未绑卡详情
					feedback: this.host + '/mimosa/boot/ope/nocard/feedback' // 未绑卡反馈
				},
				failCard: {
					list: this.host + '/mimosa/boot/ope/failcard/list', // 绑卡未成功列表
					detail: this.host + '/mimosa/boot/ope/failcard/detail', // 绑卡未成功详情
					feedback: this.host + '/mimosa/boot/ope/failcard/feedback' // 绑卡未成功反馈
				},
				norecharge: {
					list: this.host + '/mimosa/boot/ope/norecharge/list', // 未充值列表
					detail: this.host + '/mimosa/boot/ope/norecharge/detail', // 未充值详情
					feedback: this.host + '/mimosa/boot/ope/norecharge/feedback' // 未充值反馈
				},
				failrecharge: {
					list: this.host + '/mimosa/boot/ope/failrecharge/list', // 充值未成功列表
					detail: this.host + '/mimosa/boot/ope/failrecharge/detail', // 充值未成功详情
					feedback: this.host + '/mimosa/boot/ope/failrecharge/feedback' // 充值未成功反馈
				},
				nobuy: {
					list: this.host + '/mimosa/boot/ope/nobuy/list', // 未购买列表
					detail: this.host + '/mimosa/boot/ope/nobuy/detail', // 未购买详情
					feedback: this.host + '/mimosa/boot/ope/nobuy/feedback' // 未购买反馈
				},
				distribution: {
					list: this.host + '/mimosa/boot/ope/distribution/list', // 用户来源分布列表
					sourcelist: this.host + '/mimosa/boot/ope/distribution/sourcelist' // 用户来源时间段统计列表
				}
			},
			element: {
				list: this.host + '/cms/boot/element/list', // 元素配置列表
				detail: this.host + '/cms/boot/element/detail', // 元素配置详情
				delete: this.host + '/cms/boot/element/delete', // 元素配置删除
				add: this.host + '/cms/boot/element/add', // 元素配置添加
				update: this.host + '/cms/boot/element/update', // 元素配置修改
				on: this.host + '/cms/boot/element/on', // 元素配置显示
				off: this.host + '/cms/boot/element/off', // 元素配置关闭
				checkCode: this.host + '/cms/boot/element/checkCode', // 元素配置检查code
			},
			investmentPool: { // 投资标的库
				list: this.host + "/mimosa" + "/boot/investmentPool/list", // 投资标的库列表(未持有投资标的列表,已持有投资标的列表,历史投资标的列表)
				establish: this.host + "/mimosa" + "/boot/investmentPool/establish", // 标的成立
				unEstablish: this.host + "/mimosa" + "/boot/investmentPool/unEstablish", // 标的不成立
				overdue: this.host + "/mimosa" + "/boot/investmentPool/overdue", // 标的逾期
				close: this.host + "/mimosa" + "/boot/investmentPool/close", // 标的结束
				incomeSave: this.host + "/mimosa" + "/boot/investmentPool/incomeSave", // 投资标的本息兑付
				assetPoolDet: this.host + "/mimosa" + "/boot/investmentPool/assetPoolDet", // 资产池购买的该标的信息
				/** add by star.zhu start **/
				overdueN: this.host + "/mimosa" + "/boot/investmentPool/overdueN", // 投资标的 逾期 
				incomeSaveN: this.host + "/mimosa" + "/boot/investmentPool/incomeSaveN", // 投资标的 本息正常兑付
				incomeSaveD: this.host + "/mimosa" + "/boot/investmentPool/incomeSaveD", // 投资标的 本息逾期兑付
				targetCancel: this.host + "/mimosa" + "/boot/investmentPool/targetCancel", // 投资标的 坏账核销
				overdueTransfer: this.host + "/mimosa" + "/boot/investmentPool/overdueTransfer", // 投资标的 本息逾期转让
				/** add by star.zhu end **/
			},
			cashToolPool: { // 现金管理工具库
				list: this.host + "/mimosa/boot/cashToolPool/list", // 现金管理工具库列表
				remove: this.host + "/mimosa/boot/cashToolPool/remove", // 现金管理工具移除出库
				revenueSave: this.host + "/mimosa/boot/cashToolPool/revenueSave", // 现金管理工具收益采集
				listRevenue: this.host + "/mimosa/boot/cashToolPool/listRevenue", // 现金管理工具收益列表
			},
			investmentTargetIncomeList: this.host + "/mimosa/boot/targetIncome/investmentTargetIncomeList", // 投资标的本兮兑付列表
			targetIncomeSave: this.host + "/mimosa/boot/investmentPool/targetIncomeSave", // 投资标的本息兑付
			targetProjectList: this.host + "/mimosa/boot/project/projectlist", // 查询投资标的下的底层项目
			projectDetail: this.host + "/mimosa/boot/project/getByOid", // 查询底层项目详情
			targetProjectDelete: this.host + "/mimosa/boot/project/deleteProject", // 删除投资标的下的底层项目
			saveProject: this.host + "/mimosa/boot/project/save", //保存底层项目
			targetListQuery: this.host + '/mimosa/target/targetManage/list', //标的列表查询
			targetDetQuery: this.host + '/mimosa/target/targetManage/detail', //标的详情查询
			targetAdd: this.host + '/mimosa/target/targetManage/add', //新建标的
			targetEdit: this.host + '/mimosa/target/targetManage/edit', //新建标的
			targetExamine: this.host + '/mimosa/target/targetManage/examine', //标的提交预审
			targetInvalid: this.host + '/mimosa/target/targetManage/invalid', //标的作废
			targetEnter: this.host + '/mimosa/target/targetManage/enter', //标的确认
			targetCheckListQuery: this.host + '/mimosa/target/targetCheck/list', //预审标的列表查询
			targetCheckPass: this.host + '/mimosa/target/targetCheck/checkpass', //标的预审通过
			targetCheckReject: this.host + '/mimosa/target/targetCheck/checkreject', //标的预审驳回
			productApplyList: this.host + "/mimosa/product/apply/list", //查询产品申请列表
			
			jobList: this.host + "/mimosa/job/list", //查询定时任务
			jobExecuteTask: this.host + "/mimosa/job/executetack", //执行定时任务
			jobLogList: this.host + "/mimosa/job/log/list", //查询定时任务日志
			jobToken: this.host + "/mimosa/job/gettoken", //查询定时任务防止重复提交token
			
			generateIncomeFile:this.host + "/mimosa/job/generateIncomeFile", //手动生成投资人收益明细文件任务
			generateHoldFile:this.host + "/mimosa/job/generateHoldFile", //手动生成持有人手册文件任务
			generateOrderFile:this.host + "/mimosa/job/generateOrderFile", //手动生成兑付订单文件任务
			
			productAuditList: this.host + "/mimosa/product/audit/list", //查询产品审核列表
			productCheckList: this.host + "/mimosa/product/check/list", //查询产品复核列表
			savePeriodic: this.host + "/mimosa/product/save/periodic", //新加定期产品
			saveCurrent: this.host + "/mimosa/product/save/current", //新加活期产品
			updatePeriodic: this.host + "/mimosa/product/update/periodic", //更新定期产品
			updateCurrent: this.host + "/mimosa/product/update/current", //更新活期产品
			productDetail: this.host + "/mimosa/product/detail", //产品详情
			productInvalid: this.host + "/mimosa/product/delete", //产品作废
			productAuditApply: this.host + "/mimosa/product/aduit/apply", //产品审核申请
			productAuditReject: this.host + "/mimosa/product/aduit/reject", //产品审核不通过
			productAuditApprove: this.host + "/mimosa/product/aduit/approve", //产品审核通过
			productReviewReject: this.host + "/mimosa/product/review/reject", //产品复核不通过
			productReviewApprove: this.host + "/mimosa/product/review/approve", //产品复核通过
			productChooseChannelList: this.host + "/mimosa/product/channel/choose/list", //产品选择渠道列表
			productChannelList: this.host + "/mimosa/product/channel/list", //该渠道的产品列表
			productChannelUpshelf: this.host + "/mimosa/product/channel/upshelf", //上架产品
			productChannelOffshelf: this.host + "/mimosa/product/channel/donwshelf", //下架产品
			cashtoolListQuery: this.host + "/mimosa/boot/cashTool/list", //现金管理类工具列表查询
			cashtoolDetQuery: this.host + "/mimosa/boot/cashTool/detail", //现金管理类工具详情查询
			cashtoolAdd: this.host + "/mimosa/boot/cashTool/add", //新建现金管理类工具
			cashToolExamine: this.host + '/mimosa/boot/cashTool/examine', //现金管理类工具提交审核
			cashToolInvalid: this.host + '/mimosa/boot/cashTool/invalid', //现金管理类工具作废
			cashToolAccessList: this.host + '/mimosa/boot/cashTool/accessList', //现金管理类工具审核列表
			cashToolCheckpass: this.host + '/mimosa/boot/cashTool/checkpass', //现金管理类工具审核通过
			cashToolCheckreject: this.host + '/mimosa/boot/cashTool/checkreject', //现金管理类工具审核驳回
			cashToolEdit: this.host + '/mimosa/boot/cashTool/edit', //现金管理类工具编辑    
			meetingUser: this.host + '/operate/admin/search?system=' + this.system + '&rows=10&validable=true', //参会人池
			meetingTarget: this.host + '/mimosa/target/targetMeeting/targetList', //未过会标的池
			meetingAdd: this.host + '/mimosa/target/targetMeeting/addMeeting', //新建过会
			meetingList: this.host + '/mimosa/target/targetMeeting/list', //过会列表
			meetingDetail: this.host + '/mimosa/target/targetMeeting/detail', //过会详情
			meetingTargetList: this.host + '/mimosa/target/targetMeeting/meetingTarget', //过会中标的列表
			meetingTargetVoteDet: this.host + '/mimosa/target/targetMeeting/meetingTargetVoteDet', //过会中标的投票情况
			meetingSummaryUp: this.host + '/mimosa/target/targetMeeting/summaryUp', //上传会议纪要
			meetingSummaryDet: this.host + '/mimosa/target/targetMeeting/summaryDet', //获得会议纪要详情
			meetingOpen: this.host + '/mimosa/target/targetMeeting/open', //启动会议
			meetingStop: this.host + '/mimosa/target/targetMeeting/stop', //暂停会议
			meetingSummaryDelete: this.host + '/mimosa/target/targetMeeting/summaryDetele', //删除会议纪要
			meetingFinish: this.host + '/mimosa/target/targetMeeting/finish', //会议完成
			targetNewMeeting: this.host + '/mimosa/target/targetMeeting/targetMeeting', //根据标的获取最新会议
			targetCheckListAll: this.host + '/mimosa/target/targetManage/checkListAll', //标的全部检查项列表
			targetCheckList: this.host + '/mimosa/target/targetManage/checkListNotConfrim', //标的未确认检查项列表
			targetCheckListConfrim: this.host + '/mimosa/target/targetManage/checkListConfrim', //标的已确认检查项列表
			confirmCheckList: this.host + '/mimosa/target/targetManage/confirmCheckList', //过会标的检查项确认
			channelQuery: this.host + '/mimosa/channel/query', //渠道-列表查询
			addChannel: this.host + '/mimosa/channel/add', //渠道-新增
			channelinfo: this.host + '/mimosa/channel/channelinfo', //渠道-获取详情
			oneChannel: this.host + '/mimosa/channel/onechannel', //渠道-随机获取一条渠道信息
			editChannel: this.host + '/mimosa/channel/edit', //渠道-修改
			delChannel: this.host + '/mimosa/channel/delete', //渠道-删除
			setapply: this.host + '/mimosa/channel/setapply', //渠道-申请开启停用
			remarksQuery: this.host + '/mimosa/channel/remarksquery', //渠道-意见列表
			chanPdtApproveQuery: this.host + '/mimosa/boot/chanpdtapprove/query', //渠道-产品上渠道审批查询
			chanApproveQuery: this.host + '/mimosa/channelapprove/query', //渠道-渠道审批查询
			delApply: this.host + '/mimosa/channelapprove/dealapply', //渠道-处理申请开启和停用
			voteTargetList: this.host + '/mimosa/target/targetVote/list', //过会表决标的列表
			voteTarget: this.host + '/mimosa/target/targetVote/vote', //过会标的表决

			//			caccountBank: this.host + '/operate/money/bank/corporateList', // 发行人账户-获取开户行列表
			caccountBank: this.host + '/cms/client/bankCard/findall', // 发行人账户-获取CMS银行列表
			findBankByCard: this.host + '/settlement/channelBank/findBankInfoByCard', // 判断银行卡与卡号是否匹配
			caccountList: this.host + '/mimosa/boot/publisher/baseaccount/mng', // 发行人账户-列表
			bapply: this.host + '/mimosa/boot/publisher/baseaccount/bapply', // 发行人账户-绑卡申请
			bconfirm: this.host + '/mimosa/boot/publisher/baseaccount/bconfirm', // 发行人账户-绑卡确认
			unbind: this.host + '/mimosa/boot/publisher/baseaccount/unbind', // 发行人账户-解绑卡
			
			caccountOpen: this.host + '/mimosa/boot/publisher/baseaccount/open', // 发行人账户-开通企业账户
			caccountLockin: this.host + '/mimosa/corporate/lockin', // 发行人账户-锁定企业账户
			caccountLockin: this.host + '/mimosa/corporate/unlockin', // 发行人账户-解锁企业账户
			upload: this.host + '/upload', // 发行人账户-文件上传
			caccountCreate: this.host + '/mimosa/boot/publisher/baseaccount/add', // 发行人账户-新建发行人
			caccountAccproducts: this.host + '/mimosa/product/accproducts', // 发行人账户-发标记录
			getPhotoList: this.hostext + '/p/uplist?zf=', //发行人账户详情-获取企业证照
			

			uaccountQuery: this.host + '/mimosa/boot/investor/baseaccount/query', // 个人用户-列表
			uaccountLock: this.host + '/mimosa/boot/investor/baseaccount/lockuser', // 个人用户-锁定/解锁用户
			uaccountUserinfo: this.host + '/mimosa/boot/investor/baseaccount/userinfo', // 个人用户-个人信息
			uaccountCashuserinfo: this.host + '/mimosa/boot/investor/baseaccount/cashuserinfo', // 个人用户-资金信息
			uaccountCashflow: this.host + '/mimosa/boot/platform/investor/cashflow/query', // 个人用户-资金明细
			uaccountHoldconfirm: this.host + '/mimosa/boot/holdconfirm/pmng', // 个人用户-持仓列表
			uaccountIncome: this.host + '/mimosa/boot/investor/income/query', // 个人用户-收益明细
			uaccountBankorder: this.host + '/mimosa/boot/investor/bankorder/mng', // 个人用户-充提记录
			uaccountCright: this.host + '/mimosa/boot/investor/bankorder/cright', // 投资人充值冲正

			publisherMng: this.host + '/mimosa/boot/publisher/bankorder/mng', // 发行人轧差-银行转账(个人)
			publisherSmng: this.host + '/mimosa/boot/publisher/bankorder/smng', // 发行人轧差-银行转账(平台)
//			dividendoffsetMng: this.host + '/mimosa/boot/dividendoffset/mng', // 发行人红利管理
			dividendoffsetMng: this.host + '/mimosa/boot/dividendoffset/mnguid', // 发行人红利管理
			dividendoffsetClose: this.host + '/mimosa/boot/dividendoffset/close', // 发行人红利结算
			publisherPmng: this.host + '/mimosa/boot/publisheroffset/mnguid', // 发行人轧差-日结
			publisherWithdraw: this.host + '/mimosa/boot/publisher/bankorder/withdraw', // 发行人轧差-提现
			publisherDapply: this.host + '/mimosa/boot/investor/bankorder/apply/dapply', // 发行人轧差-充值申请
			publisherDeposit: this.host + '/mimosa/boot/publisher/bankorder/deposit', // 发行人轧差-充值
			publisherCollect: this.host + '/mimosa/boot/publisher/bankorder/collect', // 发行人轧差-收款
			publisherPay: this.host + '/mimosa/boot/publisher/bankorder/pay', // 发行人轧差-付款
			publisherIsdone: this.host + '/mimosa/boot/publisher/bankorder/isdone', // 发行人轧差-订单查询
			publisherUserinfo: this.host + '/mimosa/boot/publisher/baseaccount/userinfo', // 发行人轧差-发行人资金信息
			publisherSuserinfo: this.host + '/mimosa/boot/publisher/baseaccount/suserinfo', // 发行人详情-发行人资金信息
			publisherDeta: this.host + '/mimosa/boot/publisheroffset/deta', // 发行人轧差-明细
			publisherCright: this.host + '/mimosa/boot/publisher/bankorder/cright', // 发行人充值冲正

			investorImng: this.host + '/mimosa/boot/investoroffset/imng', // 投资人-平台轧差-列表
			investorDeta: this.host + '/mimosa/boot/investoroffset/deta', // 投资人轧差-明细
			iclear: this.host + '/mimosa/boot/investoroffset/iclear', // 投资人轧差-普通轧差清算
			iclose: this.host + '/mimosa/boot/investoroffset/iclose', // 投资人轧差-普通轧差结算
			fclose: this.host + '/mimosa/boot/investoroffset/fclose', // 投资人轧差-快速轧差结算

			prodDetail: this.host + "/mimosa/boot/product/detail", //产品详情

			resmoneyMng: this.host + '/mimosa/boot/reservedorder/mng', // 备付金-列表
			superaccMng: this.host + '/mimosa/boot/platform/superacc/order/query', // 基本户-列表
			collectsuper: this.host + '/mimosa/boot/platform/reservedaccount/collectsuper', // 超级用户借款
			paysuper: this.host + '/mimosa/boot/platform/reservedaccount/paysuper', // 超级用户还款
			collectbasic: this.host + '/mimosa/boot/platform/reservedaccount/collectbasic', // 基本用户借款
			paybasic: this.host + '/mimosa/boot/platform/reservedaccount/paybasic', // 基本用户还款
			paysb: this.host + '/mimosa/boot/platform/baseaccount/pay', // 超级户还款给基本户
			collectbs: this.host + '/mimosa/boot/platform/baseaccount/borrow', // 基本户借款给超级户
			resmoneyDeta: this.host + '/mimosa/boot/platform/reservedaccount/deta', // 备付金-明细
			baseaccountDeta: this.host + '/mimosa/boot/platform/baseaccount/deta', // 平台-明细
			resmoneyPhoto: this.host + 'http://api.guohuaigroup.com/mimosaui', //备付金-图片

			platformHome: this.host + '/mimosa/boot/platform/baseaccount/statistics/home', // 平台-首页

			placcountSman: this.host + '/mimosa/boot/investor/baseaccount/sman', // 平台账户-资金信息
			placcountMng: this.host + '/mimosa/boot/holdconfirm/superMng', // 平台账户-列表
			placcountSuperRedeem: this.host + '/mimosa/boot/tradeorder/superredeem', // 平台账户-赎回

			infoQuery: this.host + '/mimosa/boot/platform/inform/query', // 系统通知-列表
			
			check: {
				query: this.host + '/mimosa/boot/investor/baseaccount/check/query', //总额对账查询
				platformAmt: this.host + '/mimosa/boot/investor/baseaccount/check/getplatsumamt', // 对账平台累计金额
				unlock: this.host + '/mimosa/boot/investor/baseaccount/check/unlock', // 账户解锁
				generate: this.host + '/mimosa/boot/investor/baseaccount/check/generate', // 总额对账
				singleCheck: this.host + '/mimosa/boot/investor/baseaccount/check/singlegenerate', // 资金总额对账重算
				
				detailQuery: this.host + '/mimosa/boot/investor/baseaccount/detailcheck/query', // 明细对账查询
				detailGenetate: this.host + '/mimosa/boot/investor/baseaccount/detailcheck/generate', // 明细对账
				singleGenerate: this.host + '/mimosa/boot/investor/baseaccount/detailcheck/singlegenerate', // 资金明细对账重算
				query4recorrect: this.host + '/mimosa/boot/platform/investor/cashflow/query4recorrect', // 资金流水查询
			},
			
			logmng: this.host + '/mimosa/boot/platform/accment/log/mng', // 账户账务接口日志
			settlementLogmng: this.host + '/mimosa/boot/platform/payment/log/mng', // 结算系统接口日志
			appLogmng: this.host + '/mimosa/boot/platform/errorlog/mng', // app接口日志

			files: {
				pkg: this.host + '/mimosa/file/pkg', //获得下载key
				download: this.host + '/mimosa/file/dl?key=' //下载附件包 参数key
			},
			acct: {
				doc: {
					type: {
						search: this.host + '/mimosa/acct/doc/type/search'
					},
					template: {
						entry: {
							search: this.host + '/mimosa/acct/doc/template/entry/search'
						}
					}
				},
				account: {
					search: this.host + '/mimosa/acct/account/search',
					update: this.host + '/mimosa/acct/account/update'
				},
				book: {
					document: {
						entry: {
							search: this.host + '/mimosa/acct/books/document/entry/search',
							detail: this.host + '/mimosa/acct/books/document/entry/detail'
						}
					},
					balance: this.host + '/mimosa/acct/books/balance'
				}
			},
			invest: { // 持有人信息
				manager: {
					accountList: '/mimosa/boot/holdconfirm/pmng', // 持有人名录          
					holdList: '/mimosa/client/holdconfirm/findHoldDetailByHoldOid', // 持有人名录持有份额列表         
				},
				order: {
					unconfirmQuery: this.host + '/mimosa/boot/tradeorder/unconfirmQuery', //未确认持有人名册 未确认持有人订单管理
				}
			},
			system: {
				config: {
					ccp: {
						warrantor: {
							create: this.host + "/mimosa/system/ccp/warrantor/create",
							update: this.host + "/mimosa/system/ccp/warrantor/update",
							delete: this.host + "/mimosa/system/ccp/warrantor/delete",
							search: this.host + "/mimosa/system/ccp/warrantor/search"
						},
						warrantyMode: {
							create: this.host + "/mimosa/system/ccp/warrantyMode/create",
							update: this.host + "/mimosa/system/ccp/warrantyMode/update",
							delete: this.host + "/mimosa/system/ccp/warrantyMode/delete",
							search: this.host + "/mimosa/system/ccp/warrantyMode/search"
						},
						warrantyExpire: {
							create: this.host + "/mimosa/system/ccp/warrantyExpire/create",
							update: this.host + "/mimosa/system/ccp/warrantyExpire/update",
							delete: this.host + "/mimosa/system/ccp/warrantyExpire/delete",
							search: this.host + "/mimosa/system/ccp/warrantyExpire/search"
						},
						warrantyLevel: { // 风险等级配置
							save: this.host + "/mimosa/system/ccp/warrantyLevel/save",
							saveList: this.host + "/mimosa/system/ccp/warrantyLevel/saveList",
							delete: this.host + "/mimosa/system/ccp/warrantyLevel/delete",
							search: this.host + "/mimosa/system/ccp/warrantyLevel/search"
						}
					},
					ccr: {
						cate: {
							options: this.host + "/mimosa/system/ccr/cate/options",
							validateTitle: this.host + "/mimosa/system/ccr/cate/validateTitle",
						},
						indicate: {
							search: this.host + "/mimosa/system/ccr/indicate/search",
							save: this.host + "/mimosa/system/ccr/indicate/save",
							enable: this.host + "/mimosa/system/ccr/indicate/enable",
							disable: this.host + "/mimosa/system/ccr/indicate/disable",
							delete: this.host + "/mimosa/system/ccr/indicate/delete",
							options: this.host + "/mimosa/system/ccr/indicate/options",
							collect: {
								save: this.host + "/mimosa/system/ccr/indicate/collect/save",
								preUpdate: this.host + "/mimosa/system/ccr/indicate/collect/preUpdate"
							}
						},
						warning: { // 风险配置
							search: this.host + "/mimosa/system/ccr/warning/search",
							save: this.host + "/mimosa/system/ccr/warning/save",
							enable: this.host + "/mimosa/system/ccr/warning/enable",
							disable: this.host + "/mimosa/system/ccr/warning/disable",
							delete: this.host + "/mimosa/system/ccr/warning/delete",
							options: this.host + "/mimosa/system/ccr/warning/options",
							collect: {
								save: this.host + "/mimosa/system/ccr/warning/collect/save",
								preUpdate: this.host + "/mimosa/system/ccr/warning/collect/preUpdate"
							},
							options: {
								save: this.host + "/mimosa/system/ccr/warning/options/save",
								showview: this.host + "/mimosa/system/ccr/warning/options/showview",
								batchDelete: this.host + "/mimosa/system/ccr/warning/options/batchDelete",
								preUpdate: this.host + "/mimosa/system/ccr/warning/options/preUpdate",
								preCollect: this.host + "/mimosa/system/ccr/warning/options/preCollect",
							},
							collect: { //风险预警
								list: this.host + "/mimosa/system/ccr/warning/collect/list", //风险预警列表
								detail: this.host + "/mimosa/system/ccr/warning/collect/detail", //风险预警详情
								collectOption: this.host + "/mimosa/system/ccr/warning/collect/collectOption", //风险采集配置项
								add: this.host + "/mimosa/system/ccr/warning/collect/add", //风险采集
							},
							handle: { //风险处置
								list: this.host + "/mimosa/system/ccr/warning/collect/handle/list", //风险处置列表
								handle: this.host + "/mimosa/system/ccr/warning/collect/handle/handle", //风险处置
								hisListAll: this.host + "/mimosa/system/ccr/warning/collect/handle/hisListAll", //风险处置历史全列表
								hisList: this.host + "/mimosa/system/ccr/warning/collect/handle/hisList", //风险处置历史列表
								targetList: this.host + "/mimosa/system/ccr/warning/collect/handle/targetList",
							}
						},
						options: {
							save: this.host + "/mimosa/system/ccr/options/save",
							showview: this.host + "/mimosa/system/ccr/options/showview",
							batchDelete: this.host + "/mimosa/system/ccr/options/batchDelete",
							preUpdate: this.host + "/mimosa/system/ccr/options/preUpdate",
							preCollect: this.host + "/mimosa/system/ccr/options/preCollect",
						}
					}
				},
				productLabel: { //标签管理
					save: this.host + "/mimosa/productLabel/save",
					update: this.host + "/mimosa/productLabel/update",
					detail: this.host + "/mimosa/productLabel/detail",
					invalid: this.host + "/mimosa/productLabel/invalid",
					valid: this.host + "/mimosa/productLabel/valid",
					getProductLabelNames: this.host + "/mimosa/productLabel/getProductLabelNames",
					productLabelList: this.host + "/mimosa/productLabel/productLabelList"
				}
			},
			duration: {
				assetPool: { // 资产池
					create: this.host + "/mimosa/duration/assetPool/createPool", // 新建资产池
					audit: this.host + "/mimosa/duration/assetPool/auditPool", // 审核资产池
					edit: this.host + '/mimosa/duration/assetPool/editPool', // 修改资产池
					editPoolForCash: this.host + '/mimosa/duration/assetPool/editPoolForCash', // 编辑账户
					updateDeviationValue: this.host + '/mimosa/duration/assetPool/updateDeviationValue', // 编辑偏离损益
					getAllCapitalList: this.host + '/mimosa/duration/assetPool/getAllCapitalList', // 出入金明细
					getAll: this.host + "/mimosa/duration/assetPool/getAll", // 获取全部资产池
					getById: this.host + '/mimosa/duration/assetPool/getPoolByOid', // 获取单条资产池
					getNameList: this.host + '/mimosa/duration/assetPool/getAllNameList', // 获取资产池下拉菜单列表
					delete: this.host + '/mimosa/duration/assetPool/updateAssetPool', // 删除资产池
					userPoolProfit: this.host + '/mimosa/duration/assetPool/userPoolProfit', // 计算每日收益
					getAllSPV: this.host + '/mimosa/duration/assetPool/getAllSPV', // 获取spv列表
					loadSetting: this.host + '/mimosa/duration/assetPool/fee/setting/load', // 获取计提费率配置
					saveSetting: this.host + '/mimosa/duration/assetPool/fee/setting/save', // 保存计提费率配置
					history: {
						getAll: this.host + '/mimosa/duration/assetPool/history/getAll', // 资产池历史估值列表
					},
					schedule:{
						list: this.host + '/mimosa/duration/income/schedule/list',	// 收益分配排期列表
						applyList: this.host + '/mimosa/duration/income/schedule/apply/list',	// 收益分配申请列表
						add: this.host + '/mimosa/duration/income/schedule/apply/add',	// 收益分配申请添加
						update: this.host + '/mimosa/duration/income/schedule/apply/update',	// 收益分配申请修改
						delete: this.host + '/mimosa/duration/income/schedule/apply/delete',	// 收益分配申请删除
						pass: this.host + '/mimosa/duration/income/schedule/apply/pass',	// 收益分配申请通过
						reject: this.host + '/mimosa/duration/income/schedule/apply/reject',	// 收益分配申请驳回
						approveDelete: this.host + '/mimosa/duration/income/schedule/apply/approveDelete',	// 收益分配申请删除审核
						getBaseDate: this.host + '/mimosa/duration/income/schedule/getBaseDate',	// 获取应排期日期
					}
				},
				order: { // 订单
					fund: {
						purchase: {
							purchaseForFund: this.host + '/mimosa/duration/order/purchaseForFund', // 现金管理类工具 申购
							auditForPurchase: this.host + '/mimosa/duration/order/auditForPurchase', // 现金管理类工具 申购 审核
							appointmentForPurchase: this.host + '/mimosa/duration/order/appointmentForPurchase', // 现金管理类工具 申购 预约
							orderConfirmForPurchase: this.host + '/mimosa/duration/order/orderConfirmForPurchase', // 现金管理类工具 申购 确认
						},
						redeem: {
							redeem: this.host + '/mimosa/duration/order/redeem', // 现金管理类工具 赎回
							auditForRedeem: this.host + '/mimosa/duration/order/auditForRedeem', // 现金管理类工具 赎回 审核
							appointmentForRedeem: this.host + '/mimosa/duration/order/appointmentForRedeem', // 现金管理类工具 赎回 预约
							orderConfirmForRedeem: this.host + '/mimosa/duration/order/orderConfirmForRedeem', // 现金管理类工具 赎回 确认
						}
					},
					trust: {
						purchase: {
							purchaseForTrust: this.host + '/mimosa/duration/order/purchaseForTrust', // 信托计划 申购
							auditForTrust: this.host + '/mimosa/duration/order/auditForTrust', // 信托计划 申购 审核
							appointmentForTrust: this.host + '/mimosa/duration/order/appointmentForTrust', // 信托计划 申购 预约
							orderConfirmForTrust: this.host + '/mimosa/duration/order/orderConfirmForTrust', // 信托计划 申购 确认
						},
						trans: {
							purchaseForTrans: this.host + '/mimosa/duration/order/purchaseForTrans', // 信托计划 转入 申购
							auditForTrans: this.host + '/mimosa/duration/order/auditForTrans', // 信托计划 转入 审核
							appointmentForTrans: this.host + '/mimosa/duration/order/appointmentForTrans', // 信托计划 转入 预约
							orderConfirmForTrans: this.host + '/mimosa/duration/order/orderConfirmForTrans', // 信托计划 转入 确认
						},
						back: {
							applyForBack: this.host + '/mimosa/duration/order/applyForBack', // 信托计划 退款
							auditForBack: this.host + '/mimosa/duration/order/auditForBack', // 信托计划 退款 审核
							orderConfirmForBack: this.host + '/mimosa/duration/order/orderConfirmForBack', // 信托计划 退款 确认
						},
						income: {
							applyForIncome: this.host + '/mimosa/duration/order/applyForIncome', // 信托计划 本息兑付
							auditForIncome: this.host + '/mimosa/duration/order/auditForIncome', // 信托计划 本息兑付 审核
							orderConfirmForIncome: this.host + '/mimosa/duration/order/orderConfirmForIncome', // 信托计划 本息兑付 确认
						},
						transfer: {
							applyForTransfer: this.host + '/mimosa/duration/order/applyForTransfer', // 信托计划 转让
							auditForTransfer: this.host + '/mimosa/duration/order/auditForTransfer', // 信托计划 转让 审核
							orderConfirmForTransfer: this.host + '/mimosa/duration/order/orderConfirmForTransfer', // 信托计划 转让 确认
							applyForOverdueTransfer: this.host + '/mimosa/duration/order/applyForOverdueTransfer', // 信托计划 逾期转让
							auditForOverdueTransfer: this.host + '/mimosa/duration/order/auditForOverdueTransfer', // 信托计划 逾期转让 审核
							orderConfirmForOverdueTransfer: this.host + '/mimosa/duration/order/orderConfirmForOverdueTransfer', // 信托计划 逾期转让 确认
						}
					},
					getTrustOrderByOid: this.host + '/mimosa/duration/order/getTrustOrderByOid', // 根据ID获取预约中信托计划
					getTrustByOid: this.host + '/mimosa/duration/order/getTrustByOid', // 根据ID获取已成立信托计划
					getFundOrderByOid: this.host + '/mimosa/duration/order/getFundOrderByOid', // 根据ID获取预约中现金管理类工具
					getFundByOid: this.host + '/mimosa/duration/order/getFundByOid', // 根据ID获取现金管理类工具
					delete: this.host + '/mimosa/duration/order/updateOrder', // 逻辑删除订单
					updateFund: this.host + '/mimosa/duration/order/updateFund', // 纠偏 现金管理类工具 持有额度
					updateTrust: this.host + '/mimosa/duration/order/updateTrust', // 纠偏信托计划 持有额度
					cancelOrder: this.host + '/mimosa/duration/order/cancelOrder', // 逻辑作废订单--坏账核销
					getTargetOrderByOidForCapital: this.host + '/mimosa/duration/order/getTargetOrderByOidForCapital', // 出入金详情
				},
				target: { // 标的
					getTargetList: this.host + '/mimosa/duration/target/getTargetList', // 获取标的列表
					getTrustListForAppointment: this.host + '/mimosa/duration/target/getTrustListForAppointment', // 获取 预约中信托（计划）列表
					getTrustList: this.host + '/mimosa/duration/target/getTrustList', // 获取 信托（计划）列表
					getFundListForAppointment: this.host + '/mimosa/duration/target/getFundListForAppointment', // 获取 预约中现金管理类工具列表
					getFundList: this.host + '/mimosa/duration/target/getFundList', // 获取 现金管理类工具列表
					getDataByCashtoolOid: this.host + '/mimosa/duration/target/getDataByCashtoolOid', // 根据 oid 获取 现金管理工具 的申购列表
					getDataByTargetOid: this.host + '/mimosa/duration/target/getDataByTargetOid', // 根据 oid 获取 信托（计划） 的申购列表
					getRepaymentScheduleList: this.host + '/mimosa/duration/target/getRepaymentScheduleList', // 还款计划
				},
				market: { // 市值
					getMarketAdjustData: this.host + '/mimosa/duration/market/getMarketAdjustData', // 市值校准录入 详情表单
					saveMarketAdjust: this.host + '/mimosa/duration/market/saveMarketAdjust', // 市值校准录入
					getMarketAdjust: this.host + '/mimosa/duration/market/getMarketAdjust', // 市值校准记录详情
					auditMarketAdjust: this.host + '/mimosa/duration/market/auditMarketAdjust', // 市值校准录入审核
					getMarketAdjustStuts: this.host + '/mimosa/duration/market/getMarketAdjustStuts', // 查询当天的订单状态
					deleteMarketAdjust: this.host + '/mimosa/duration/market/deleteMarketAdjust', // 市值校准录入删除
					getMarketAdjustList: this.host + '/mimosa/duration/market/getMarketAdjustList', // 市值校准记录 列表
					getYield: this.host + '/mimosa/duration/market/getYield', // 收益率 列表
				},
				income: { // 收益分配
					getIncomeAdjustData: this.host + '/mimosa/duration/income/getIncomeAdjustData', // 收益分配录入 详情表单
					getTotalScaleRewardBenefit: this.host + '/mimosa/duration/income/getTotalScaleRewardBenefit', // 根据资产池和收益分配日获取 产品总规模和奖励收益
					saveIncomeAdjust: this.host + '/mimosa/duration/income/saveIncomeAdjust', // 收益分配录入
					getIncomeAdjust: this.host + '/mimosa/duration/income/getIncomeAdjust', // 收益分配记录详情
					auditPassIncomeAdjust: this.host + '/mimosa/duration/income/auditPassIncomeAdjust', // 收益分配录入审核通过
					auditFailIncomeAdjust: this.host + '/mimosa/duration/income/auditFailIncomeAdjust', // 收益分配录入审核不通过
					deleteIncomeAdjust: this.host + '/mimosa/duration/income/deleteIncomeAdjust', // 收益分配录入删除
					getIncomeAdjustList: this.host + '/mimosa/duration/income/getIncomeAdjustList', // 收益分配记录 列表
					getIncomeAdjustAuditList: this.host + '/mimosa/duration/income/getIncomeAdjustAuditList', // 收益分配记录审核 列表
					allocateIncomeAgain: this.host + '/mimosa/duration/income/allocateIncomeAgain', // 收益分配再次发送
					allocateIncomeHolders: this.host + '/mimosa/boot/investor/holdapartincome/mng' //收益分配持有人明细分页列表
				},
				feigin: { // 费金提取
					create: this.host + '/mimosa/duration/feigin/create', // 费金计提
					getByOid: this.host + '/mimosa/duration/feigin/getByOid', // 获取费金计提表单
					updateByOid: this.host + '/mimosa/duration/feigin/updateByOid', // 费金提取
					deleteByOid: this.host + '/mimosa/duration/feigin/deleteByOid', // 逻辑删除
					getAll: this.host + '/mimosa/duration/feigin/getAll', // 费金计提列表
				},
				spv: { // spv
					create: this.host + '/mimosa/duration/spv/create', // spv创建
					getByOid: this.host + '/mimosa/duration/spv/getByOid', // 获取spv
					update: this.host + '/mimosa/duration/spv/update', // 更新spv
					edit: this.host + '/mimosa/duration/spv/edit', // 更新spv
					getAll: this.host + '/mimosa/duration/spv/getAll', // 获取spv列表
				}
			},
			gacha: {
				mng: this.host + '/mimosa/boot/publisheroffset/mng', // 轧差查询
				tradeorder: this.host + '/mimosa/boot/tradeorder/mng', // 轧差所属订单查询
				findsoid: this.host + '/mimosa/boot/productoffset/findsoid', // 待录入产品查询
				clear: this.host + '/mimosa/boot/publisheroffset/clear', // 清算
				volconfirm: this.host + '/mimosa/boot/publisheroffset/volconfirm', // 份额确认
				close: this.host + '/mimosa/boot/publisheroffset/close', // 结算
				offsetmoney: this.host + '/mimosa/boot/publisheroffset/offsetmoney', // 录入产品手续费
				refuse: this.host + '/mimosa/boot/tradeorder/refuse', // 拒绝赎回单
				abandon: this.host + '/mimosa/boot/tradeorder/abandon', // 作废投资单
				refundpart: this.host + '/mimosa/boot/tradeorder/refundpart', // 订单退款(部分)
				refundall: this.host + '/mimosa/boot/tradeorder/refundall', // 订单退款(全部)
				findSPVAndCustomer: this.host + '/mimosa/boot/accounting/findSPVAndCustomer', // 获取SPV列表和关联账户信息
				getAccruedFeeListByOid: this.host + '/mimosa/boot/lx/serfee/getAccruedFeeListByOid', // 获取渠道产品计提明细
				getFeeListByOid: this.host + '/mimosa/boot/lx/serfee/getFeeListByOid', // 获取渠道产品支付明细
				offsetFee: this.host + '/mimosa/boot/accounting/findOffsetFee',
				repayment: this.host + '/mimosa/boot/tradeorder/repayment', // 重新结算
			},
			publisher: {
				holdapart: {
					holdQuery: this.host + '/mimosa/boot/publisher/holdapart/query'
				},
				baseAccount: {
					publisherhome: this.host + '/mimosa/boot/publisher/baseaccount/statistics/publisherhome'
				}
			},
			role: {
				list: this.host + '/operate/admin/ctrl/role/list', // 角色列表
				save: this.host + '/operate/admin/ctrl/role/save', // 新建角色
				update: this.host + '/operate/admin/ctrl/role/update', // 修改角色
				delete: this.host + '/operate/admin/ctrl/role/delete' // 删除角色
			},
			user: {
				search: this.host + '/operate/admin/search', // 用户查找
				roles: this.host + '/operate/admin/role/roles', //当前用户角色
				create: this.host + '/operate/admin/create/form', // 添加用户
				update: this.host + '/operate/admin/update', // 修改用户
				freeze: this.host + '/operate/admin/freeze', // 冻结用户
				unfreeze: this.host + '/operate/admin/unfreeze' //解冻用户
			},
			menu: {
				load: this.host + '/operate/system/menu/2.0/load', // 菜单-加载菜单数据
				save: this.host + '/operate/system/menu/2.0/save', // 菜单-保存菜单数据
				view: this.host + '/operate/system/menu/2.0/view', // 菜单-用户菜单获取
			},
			spvOrderList: this.host + "/mimosa/spv/order/list", //spv订单列表
			spvOrderDetail: this.host + "/mimosa/spv/order/detail", //spv订单详情
			spvOrderInvalid: this.host + "/mimosa/spv/order/delete", //spv作废订单
			spvOrderConfirm: this.host + "/mimosa/spv/order/confirm", //审核确定spv订单
			spvOrderReemAmount: this.host + "/mimosa/spv/order/reemAmount", //赎回订单可赎回金额
			spvOrderProduct: this.host + "/mimosa/spv/order/product", //根据资产池获取关联的产品
			saveSpvOrder: this.host + "/mimosa/spv/order/save", //新加spv订单
			productRewardList: this.host + "/mimosa/product/reward/list", //产品奖励收益设置查询列表
			saveProductReward: this.host + "/mimosa/product/reward/save", //保存产品奖励收益设置
			product: {
				apply: {
					getOptionalAssetPoolNames: this.host + "/mimosa/product/getOptionalAssetPoolNameList", //获取prodictOid对应产品所有可以选择的资产池的名称列表
					getHoldByAssetPoolOid: this.host + "/mimosa/boot/holdconfirm/getHoldByAssetPoolOid" //根据资产池和资产池对应的hold 本金余额(持有总份额) totalHoldVolume
				},
				duration: {
					productDurationList: this.host + "/mimosa/product/duration/list", // 查询产品运营列表
					productNameList: this.host + "/mimosa/product/duration/productNameList", // 查询产品运营下拉列表
					getProductByOid: this.host + "/mimosa/product/duration/getProductByOid", // 查询存续期产品默认一个产品
					getProductDuration: this.host + "/mimosa/product/duration/getProductDuration", // 查询存续期产品默认一个产品的统计信息
					productPurchaseRemeedApplyList: this.host + "/mimosa/product/duration/operate/purchaseRemeedApplyList", // 查询产品申购开关,赎回开关申请列表
					openPurchase: this.host + "/mimosa/product/duration/operate/openPurchase", //产品打开申购开关申请
					closePurchase: this.host + "/mimosa/product/duration/operate/closePurchase", // 产品关闭申购开关申请
					openRedeem: this.host + "/mimosa/product/duration/operate/openRedeem", // 产品打开赎回开关申请
					closeRedeem: this.host + "/mimosa/product/duration/operate/closeRedeem", // 产品关闭赎回开关申请
					closingFIFOApply: this.host + "/mimosa/product/duration/operate/closingFIFOApply", // 产品赎回规则FIFO申请
					closingLIFOApply: this.host + "/mimosa/product/duration/operate/closingLIFOApply", // 产品赎回规则LIFO申请
					passPurchaseRemeed: this.host + "/mimosa/product/duration/operate/passPurchaseRemeed", //  审核通过-(申请打开申购,申请关闭申购,申请打开赎回,申请关闭赎回)
					failPurchaseRemeed: this.host + "/mimosa/product/duration/operate/failPurchaseRemeed", // 审核驳回-(申请打开申购,申请关闭申购,申请打开赎回,申请关闭赎回)
					rollbackPurchaseRemeed: this.host + "/mimosa/product/duration/operate/rollbackPurchaseRemeed", //撤销-(申请打开申购,申请关闭申购,申请打开赎回,申请关闭赎回)
					deletePurchaseRemeed: this.host + "/mimosa/product/duration/operate/deletePurchaseRemeed", // 删除-(申请打开申购,申请关闭申购,申请打开赎回,申请关闭赎回)
					productClearing: this.host + "/mimosa/product/duration/productClearing", //触发产品清盘
					practice: this.host + '/mimosa/boot/practice/query', // 数据分布
					findpid: this.host + '/mimosa/boot/productoffset/findpid', // 刷新产品实时轧差结果
					currentTradingRuleSet: this.host + "/mimosa/product/duration/currentTradingRuleSet", //更新活期产品  交易规则设置
					updateSingleDailyMaxRedeem: this.host + "/mimosa/product/duration/updateSingleDailyMaxRedeem", // 单人单日赎回限额设置          
					updateFastRedeem: this.host + "/mimosa/product/duration/updateFastRedeem", // 快速赎回设置
					openRedeemConfirm: this.host + "/mimosa/product/duration/openRedeemConfirm", // 激活赎回确认
					closeRedeemConfirm: this.host + "/mimosa/product/duration/closeRedeemConfirm", // 屏蔽赎回确认
					updateProductLabel: this.host + "/mimosa/product/duration/updateProductLabel", // 标签设置确认
					productRaiseFail: this.host + "/mimosa/product/duration/productRaiseFail", // 募集失败
					productRaiseSuccess: this.host + "/mimosa/product/duration/productRaiseSuccess", // 募集成功
					productDeta: this.host + "/mimosa/boot/practice/deta", // 获取最近日期产品总规模
					cash: this.host + "/mimosa/product/cash", // 还本付息
					allocateIncome: this.host + "/mimosa/product/allocateIncome", // 派息
					isAutoAssignIncomeSet: this.host + '/mimosa/product/duration/isAutoAssignIncomeSet' //是否自动派息设置
				},
				spv: {
					getProductSpvOrderlist: this.host + "/mimosa/product/duration/spvOrder/list", //产品对应的spv订单列表
					getProductSpvSpvOrderlist: this.host + "/mimosa/product/duration/spvOrder/spvlist" //产品和spv对应的spv订单列表
				},
				salePosition: {
					findSalePositionApply: this.host + "/mimosa/product/duration/salePosition/findSalePositionApply", // 是否已经有申请过的
					saleVolumeApplyList: this.host + "/mimosa/product/duration/salePosition/saleVolumeApplyList", // 查询产品可售份额申请列表
					saleVolumeScheduleList: this.host + "/mimosa/product/duration/salePosition/saleVolumeScheduleList", // 查询产品可售份额排期历史列表
					saveAvailbleSaleVolume: this.host + "/mimosa/product/duration/salePosition/save", // 新加产品可售份额申请
					auditPassAvailbleSaleVolume: this.host + "/mimosa/product/duration/salePosition/auditPass", // 产品可售份额申请审核通过
					auditFailAvailbleSaleVolume: this.host + "/mimosa/product/duration/salePosition/auditFail", // 产品可售份额申请审核驳回
					rollbackAvailbleSaleVolume: this.host + "/mimosa/product/duration/salePosition/rollback", // 产品可售份额申请撤销
					deleteAvailbleSaleVolume: this.host + "/mimosa/product/duration/salePosition/delete" // 产品可售份额申请删除
				},
				channel: {
					chooseChannels: this.host + "/mimosa/product/channel/order/channels", //可以选择的全部启用状态的渠道列表
					channelApplyList: this.host + "/mimosa/product/channel/order/channelApplyList", //查询产品渠道申请列表
					productChannels: this.host + "/mimosa/product/channel/order/productChannels", // 查询产品已经申请的渠道列表
					saveChannel: this.host + "/mimosa/product/channel/order/saveChannel", //新加产品渠道申请
					rollbackChannel: this.host + "/mimosa/product/channel/order/rollbackChannel", //产品渠道申请撤销
					auditFailChannel: this.host + "/mimosa/product/channel/order/auditFailChannel", //产品渠道申请审核驳回
					auditPassChannel: this.host + "/mimosa/product/channel/order/auditPassChannel", //产品渠道申请审核通过
					deleteChannel: this.host + "/mimosa/product/channel/order/deleteChannel" //产品渠道申请删除
				}
			},
			channelDetail: {
				product: this.host + '/mimosa/product/channel/channelQuery', // 渠道详情产品列表
			},
			/*投资组合配置 开始*/
			liquidAsset: { // 现金类标的管理
				addFund: this.host + "/mimosa/boot/liquidAsset/addFund", //货币基金添加资产
				addTreaty: this.host + "/mimosa/boot/liquidAsset/addTreaty", //协定存款添加资产
				list: this.host + "/mimosa/boot/liquidAsset/list", // 投资标的查询
				detailQuery: this.host + "/mimosa/boot/liquidAsset/detail", // 投资标的详情查询
				edit: this.host + "/mimosa/boot/liquidAsset/edit", // 编辑标的资产
				invalid: this.host + "/mimosa/boot/liquidAsset/invalid", // 资产作废
				examine: this.host + "/mimosa/boot/liquidAsset/examine", // 标的提交审核
				options: this.host + "/mimosa/boot/liquidAsset/options", // 获取标的的类型名称
				accessList: this.host + "/mimosa/boot/liquidAsset/accessList", //现金类标的审查
				checkpass: this.host + "/mimosa/boot/liquidAsset/checkpass", //现金类标的审核通过
				checkreject: this.host + "/mimosa/boot/liquidAsset/checkreject" //现金类标的驳回
			},
			liquidAssetPool: {
				list: this.host + "/mimosa/boot/liquidAsset/storageList", //现金类标的备选库查询
				remove: this.host + "/mimosa/boot/liquidAsset/remove", //现金类标的备选库作废
				yieldSave: this.host + "/mimosa/boot/liquidAssetYield/yieldSave", //现金类标的收益采集保存
				listYield: this.host + "/mimosa/boot/liquidAssetYield/listYield", //现金类标的收益采集分页查询
				dateVerify: this.host + "/mimosa/boot/liquidAssetYield/dateVerify" //货币基金收益采集日期校验
			},
			illiquidAsset: { // 非现金标的库
				assetList: this.host + '/mimosa/illiquidAsset/main/list', // 非现金标的列表
				assetDetail: this.host + '/mimosa/illiquidAsset/main/detail', // 非现金标的详情
				addAsset: this.host + '/mimosa/illiquidAsset/main/add', // 新建非现金标的
				editAsset: this.host + '/mimosa/illiquidAsset/main/edit', // 修改非现金标的
				examineAsset: this.host + '/mimosa/illiquidAsset/main/examine', // 提交审核非现金标的
				invalidAsset: this.host + '/mimosa/illiquidAsset/main/invalid', // 作废非现金标的
				checklist: this.host + '/mimosa/illiquidAsset/main/checklist', // 非现金标的审核列表
				checkpass: this.host + '/mimosa/illiquidAsset/main/checkpass', // 通过非现金标的
				checkpassY: this.host + '/mimosa/illiquidAsset/main/checkpassY', // 通过非现金标的 非信托
				checkpassN: this.host + '/mimosa/illiquidAsset/main/checkpassN', // 驳回非现金标的 非信托
				checkreject: this.host + '/mimosa/illiquidAsset/main/checkreject', // 驳回非现金标的
				enterAsset: this.host + '/mimosa/illiquidAsset/main/enter', // 确定非现金标的
				poolList: this.host + '/mimosa/illiquidAsset/main/poolList', // 标的库列表  备选库  已持有  未持有  历史
				establish: this.host + '/mimosa/illiquidAsset/main/establish', // 标的成立
				unEstablish: this.host + '/mimosa/illiquidAsset/main/unEstablish', // 标的不成立
				overdueN: this.host + '/mimosa/illiquidAsset/main/overdueN', // 标的逾期
				incomeSaveN: this.host + '/mimosa/illiquidAsset/main/incomeSaveN', // 标的正常还款
				incomeSaveD: this.host + '/mimosa/illiquidAsset/main/incomeSaveD', // 标的逾期还款
				overdueTransfer: this.host + '/mimosa/illiquidAsset/main/overdueTransfer', // 标的逾期转让
				transfer: this.host + '/mimosa/illiquidAsset/main/transfer', // 标的转让
				targetCancel: this.host + '/mimosa/illiquidAsset/main/targetCancel', // 标的坏账核销
				close: this.host + '/mimosa/illiquidAsset/main/close', // 标的结束

				projectlist: this.host + '/mimosa/illiquidAsset/project/projectlist', // 底层项目列表
				saveProject: this.host + '/mimosa/illiquidAsset/project/save', // 保存底层项目
				deleteProject: this.host + '/mimosa/illiquidAsset/project/deleteProject', // 删除
				projectByIlliquidAssetOid: this.host + '/mimosa/illiquidAsset/project/getByIlliquidAssetOid', // 根据标的oid获取
				projectDetail: this.host + '/mimosa/illiquidAsset/project/detail', // 详细
				changePlan: this.host + '/mimosa/illiquidAsset/plan/changePlan',
				savePlan: this.host + '/mimosa/illiquidAsset/plan/savePlan',
				planList: this.host + '/mimosa/illiquidAsset/plan/planList', // 预期还款计划列表
			},
			portfolio: { //投资组合	
				portfolioList: this.host + '/mimosa/portfolioManage/portfolio/getListByParams', //获取投资组合列表
				getListByPass: this.host + '/mimosa/portfolioManage/portfolio/getListByPass', // 获取投资组合下拉菜单列表
				getAllNameList: this.host + '/mimosa/portfolioManage/portfolio/getAllNameList', //获取所有投资组合json列表，包含id和name"
				getValuationListByParams: this.host + '/mimosa/portfolioManage/portfolio/getValuationListByParams', //获取所有投资组合历史估值列表
				createPortfolio: this.host + '/mimosa/portfolioManage/portfolio/createPortfolio', //新建投资组合
				getPortfolioByOid: this.host + '/mimosa/portfolioManage/portfolio/getPortfolioByOid', //根据oid查询投资组合
				editPortfolio: this.host + '/mimosa/portfolioManage/portfolio/editPortfolio', //编辑投资组合
				deletePortfolio: this.host + '/mimosa/portfolioManage/portfolio/deletePortfolio', //物理删除投资组合
				updatePortfolio: this.host + '/mimosa/portfolioManage/portfolio/updatePortfolio', //逻辑删除投资组合
				auditPortfolio: this.host + '/mimosa/portfolioManage/portfolio/auditPortfolio', //新建审核投资组合
				getAllSPV: this.host + '/mimosa/portfolioManage/portfolio/getAllSPV', //获取spv列表
				examine: this.host + '/mimosa/portfolioManage/portfolio/examine', //投资组合提交审核
				cancel: this.host + '/mimosa/portfolioManage/portfolio/cancel', //投资组合撤销审核
				getPortfolioByOid: this.host + '/mimosa/portfolioManage/portfolio/getPortfolioByOid', //投资组合详情
				getNetValueInfo: this.host + '/mimosa/portfolioManage/portfolio/getNetValueInfo', //获取净值校准详情
				getNetValueListByParams: this.host + '/mimosa/portfolioManage/portfolio/getNetValueListByParams', //获取所有投资组合净值校准列表
				updateNetValue: this.host + '/mimosa/portfolioManage/portfolio/updateNetValue', //净值校准
				getIncomeList: this.host + '/mimosa/portfolioManage/portfolio/getIncomeList', //获取投资组合收益分配列表
				getLiquidHoldList: this.host + '/mimosa/portfolioManage/portfolio/getLiquidHoldList', //获取所有投资组合持仓现金类资产列表
				getIlliquidHoldList: this.host + '/mimosa/portfolioManage/portfolio/getIlliquidHoldList', //获取所有投资组合持仓非现金类资产列表
				getTadeist: this.host + '/mimosa/portfolioManage/portfolio/getTadeist', //获取资产交易列表
				getDeviationList: this.host + '/mimosa/portfolioManage/portfolio/getDeviationList', //获取投资损益列表
				getLiquidHoldList: this.host + '/mimosa/portfolioManage/portfolio/getLiquidHoldList', //获取所有投资组合持仓现金类资产列表
				statistics: this.host + '/mimosa/portfolioManage/portfolio/statistics', //获取投资组合统计数据
				chargefeeList: this.host + '/mimosa/portfolio/estimate/chargefeeList', //获取投资组合累计计提费用明细
				theNew: this.host + '/mimosa/portfolio/estimate/theNew', //获取投资组合最新估值日和累计计提费用

				prepare: this.host + '/mimosa/portfolio/netCorrect/prepare', //净值校准  准备
				submit: this.host + '/mimosa/portfolio/netCorrect/order/submit', //净值校准  提交审核
				pass: this.host + '/mimosa/portfolio/netCorrect/order/pass', //净值校准  审核通过
				fail: this.host + '/mimosa/portfolio/netCorrect/order/fail', //净值校准  审核驳回
				delete: this.host + '/mimosa/portfolio/netCorrect/order/delete', //净值校准  删除
				getListByAuditing: this.host + '/mimosa/portfolio/netCorrect/order/getListByAuditing', //净值校准  待审核列表
				getListByRecording: this.host + '/mimosa/portfolio/netCorrect/order/getListByRecording', //净值校准  记录列表
				getListByHistory: this.host + '/mimosa/portfolio/netCorrect/getListByHistory', //净值校准  历史总资产净值列表
				getListByLosses: this.host + '/mimosa/portfolio/invest/Losses/getListByLosses', //投资损益列表
				
				purchaseForLiquid: this.host + '/mimosa/market/order/purchaseForLiquid', //现金类资产申购   新建
				passForPurchaseLiquid: this.host + '/mimosa/market/order/passForPurchaseLiquid', //现金类资产申购   审核通过
				failForPurchaseLiquid: this.host + '/mimosa/market/order/failForPurchaseLiquid', //现金类资产申购   审核驳回
				redeemForLiquid: this.host + '/mimosa/market/order/redeemForLiquid', //现金类资产赎回   新建
				passRedeemForLiquid: this.host + '/mimosa/market/order/passRedeemForLiquid', //现金类资产赎回   审核通过
				failRedeemForLiquid: this.host + '/mimosa/market/order/failRedeemForLiquid', //现金类资产赎回   审核驳回
				getLiquidRedeemOrderList: this.host + '/mimosa/market/order/getLiquidRedeemOrderList', //现金类资产赎回   详情
				getMarketOrderListByPortfolioOid: this.host + '/mimosa/market/order/getMarketOrderListByPortfolioOid', //获取资产交易列表--通过 驳回
				getToAuditMarketOrderListByPortfolioOid: this.host + '/mimosa/market/order/getToAuditMarketOrderListByPortfolioOid', //获取资产交易列表--新建待审核
				getMarketOrderRecordList: this.host + '/mimosa/market/order/getMarketOrderRecordList', //获取资产交易记录列表
				getLiquidManageOrderList: this.host + '/mimosa/market/order/getLiquidManageOrderList', //获取现金类管理资产列表
				getMarketOrderByOid: this.host + '/mimosa/market/order/getMarketOrderByOid', //获取资产交易详情
				

				getIlliquidManageOrderList: this.host + '/mimosa/market/order/getIlliquidManageOrderList', //获取非现金类管理资产列表
				subscripeForIlliquid: this.host + '/mimosa/market/order/subscripeForIlliquid', //非现金类资产认购   新建
				passForSubscripeIlliquid: this.host + '/mimosa/market/order/passForSubscripeIlliquid', //非现金类资产认购   审核通过
				failForubscripeIlliquid: this.host + '/mimosa/market/order/failForubscripeIlliquid', //非现金类资产认购   审核驳回
				purchaseForIlliquid: this.host + '/mimosa/market/order/purchaseForIlliquid', //非现金类资产申购   新建
				passForPurchaseIlliquid: this.host + '/mimosa/market/order/passForPurchaseIlliquid', //非现金类资产申购   审核通过
				failForPurchaseIlliquid: this.host + '/mimosa/market/order/failForPurchaseIlliquid', //非现金类资产申购   审核驳回
				repaymentForIlliquid: this.host + '/mimosa/market/order/repaymentForIlliquid', //非现金类资产还款   新建
				passRepaymentForIlliquid: this.host + '/mimosa/market/order/passRepaymentForIlliquid', //非现金类资产还款   审核通过
				failRepaymentForIlliquid: this.host + '/mimosa/market/order/failRepaymentForIlliquid', //非现金类资产还款   审核驳回
				getIlliquidRedeemOrderList: this.host + '/mimosa/market/order/getIlliquidRedeemOrderList', //非现金类资产   详情

				repaymentList: this.host + '/mimosa/illiquid/hold/repayment/list', //非现金类资产还款计划表
				repaymentForIlliquid: this.host + '/mimosa/market/order/repaymentForIlliquid', //非现金类资产还款  新建审核
				passRepaymentForIlliquid: this.host + '/mimosa/market/order/passRepaymentForIlliquid', //非现金类资产还款  审核通过
				failRepaymentForIlliquid: this.host + '/mimosa/market/order/failRepaymentForIlliquid', //非现金类资产还款  审核驳回

				transferForIlliquid: this.host + '/mimosa/market/order/transferForIlliquid', //非现金类资产转让  新建审核
				passTransferForIlliquid: this.host + '/mimosa/market/order/passTransferForIlliquid', //非现金类资产转让  审核通过
				failTransferForIlliquid: this.host + '/mimosa/market/order/failTransferForIlliquid', //非现金类资产转让  审核驳回

				overduetransForIlliquid: this.host + '/mimosa/market/order/overduetransForIlliquid', //非现金类资产逾期转让  新建审核
				passOverduetransForIlliquid: this.host + '/mimosa/market/order/passOverduetransForIlliquid', //非现金类资产逾期转让  审核通过
				failOverduetransForIlliquid: this.host + '/mimosa/market/order/failOverduetransForIlliquid', //非现金类资产逾期转让  审核驳回

				selloutForIlliquid: this.host + '/mimosa/market/order/selloutForIlliquid', //非现金类资产转出  新建审核
				passSelloutForIlliquid: this.host + '/mimosa/market/order/passSelloutForIlliquid', //非现金类资产转出  审核通过
				failSelloutForIlliquid: this.host + '/mimosa/market/order/failSelloutForIlliquid', //非现金类资产转出  审核驳回

				cancellateForIlliquid: this.host + '/mimosa/market/order/cancellateForIlliquid', //非现金类资产坏账核销  新建审核
				passCancellateForIlliquid: this.host + '/mimosa/market/order/passCancellateForIlliquid', //非现金类资产坏账核销  审核通过
				failCancellateForIlliquid: this.host + '/mimosa/market/order/failCancellateForIlliquid', //非现金类资产坏账核销  审核驳回

				overdueCancellateForIlliquid: this.host + '/mimosa/market/order/overdueCancellateForIlliquid', //非现金类资产逾期坏账核销  新建审核
				passOverdueCancellateForIlliquid: this.host + '/mimosa/market/order/passOverdueCancellateForIlliquid', //非现金类资产逾期坏账核销  审核通过
				failOverdueCancellateForIlliquid: this.host + '/mimosa/market/order/failOverdueCancellateForIlliquid', //非现金类资产逾期坏账核销  审核驳回
				
				refundForIlliquid: this.host + '/mimosa/market/order/refundForIlliquid', //非现金类资产退款  新建审核
				passRefundForIlliquid: this.host + '/mimosa/market/order/passRefundForIlliquid', //非现金类资产退款  审核通过
				failRefundForIlliquid: this.host + '/mimosa/market/order/failRefundForIlliquid', //非现金类资产退款  审核驳回

				subscripeOptions: this.host + '/mimosa/illiquidAsset/main/subscripeOptions', //获取非现金类管理资产可认购列表
				purchaseOptions: this.host + '/mimosa/illiquidAsset/main/purchaseOptions', //获取非现金类管理资产可申购列表

				getAuditListByParams: this.host + '/mimosa/portfolio/audit/getAuditListByParams', //获取投资组合审核列表
				getNetValueAuditListByParams: this.host + '/mimosa/portfolio/audit/getNetValueAuditListByParams', //获取净值校准审核列表
				auditToPorfolio: this.host + '/mimosa/portfolio/audit/auditToPorfolio', //投资组合审核
				auditToNetValue: this.host + '/mimosa/portfolio/audit/auditToNetValue', //净值校准审核
				auditToOrder: this.host + '/mimosa/portfolio/audit/auditToOrder', //资产交易审核
				auditRecordList: this.host + '/mimosa/portfolio/audit/getListByParams', //审核记录
				getAuditRecordByOid: this.host + '/mimosa/portfolio/audit/getAuditRecordByOid', //审核记录详情
			},
			/*投资组合配置 结束*/
			//CMS相关
			cmsChannelQuery: this.host + '/cms/boot/channel/query', // 渠道列表查询
			cmsChannelAdd: this.host + '/cms/boot/channel/add', // 渠道新增/删除
			cmsChannelDel: this.host + '/cms/boot/channel/delete', // 渠道删除
			cmsChannelSelect: this.host + '/cms/boot/channel/getSelect', // 渠道下拉

			protocolList: this.host + '/cms/boot/protocol/query', // 协议列表查询
			protocolAdd: this.host + '/cms/boot/protocol/add', // 协议新增/删除
			protocolDel: this.host + '/cms/boot/protocol/delete', // 协议删除
			protocolTypeSelect: this.host + '/cms/boot/protocol/type/getSelect', // 协议类型下拉

			actRuleList: this.host + '/cms/boot/actrule/query', // 活动规则列表查询
			actRuleAdd: this.host + '/cms/boot/actrule/add', // 活动规则新增/删除
			actRuleDel: this.host + '/cms/boot/actrule/delete', // 活动规则删除
			actRuleTypeSelect: this.host + '/cms/boot/actrule/type/getSelect', // 活动规则类型下拉

			bannerList: this.host + '/cms/boot/banner/query', // banner-获取列表
			bannerSortList: this.host + '/cms/boot/banner/sortQuery', // banner-获取排序好的列表
			bannerAdd: this.host + '/cms/boot/banner/add', // banner-新增
			bannerUpdate: this.host + '/cms/boot/banner/update', // banner-修改
			bannerDelete: this.host + '/cms/boot/banner/delete', // banner-删除
			bannerActive: this.host + '/cms/boot/banner/active', // banner-批量上下架
			bannerDealApprove: this.host + '/cms/boot/banner/dealapprove', // banner-审批

			noticeList: this.host + '/cms/boot/notice/query', // 公告-获取列表
			noticeAdd: this.host + '/cms/boot/notice/add', // 公告-新增
			noticeUpdate: this.host + '/cms/boot/notice/update', // 公告-修改
			noticeDelete: this.host + '/cms/boot/notice/delete', // 公告-删除
			noticeOnshelf: this.host + '/cms/boot/notice/onshelf', // 公告-上下架
			noticeDealApprove: this.host + '/cms/boot/notice/dealapprove', // 公告-审批
			noticePage: this.host + '/cms/boot/notice/setPage', // 公告-首页推荐
			noticeTop: this.host + '/cms/boot/notice/setTop', // 公告-是否置顶

			tabList: this.host + '/cms/boot/advice/tab/query', // 反馈意见-获取标签列表
			tabAdd: this.host + '/cms/boot/advice/tab/add', // 反馈意见-新增
			tabDelete: this.host + '/cms/boot/advice/tab/delete', // 反馈意见-删除
			tabsSelect: this.host + '/cms/boot/advice/tab/getSelect', // 反馈意见-标签select下拉列表

			adviceList: this.host + '/cms/boot/advice/query', // 反馈意见-获取列表
			adviceToTab: this.host + '/cms/boot/advice/addToTab', // 反馈意见-添加标签
			adviceToRemark: this.host + '/cms/boot/advice/remark', // 反馈意见-意见处理

			imagesList: this.host + '/cms/boot/images/query', // 图片管理-获取列表
			imagesAdd: this.host + '/cms/boot/images/add', // 图片管理-新增
			imagesDel: this.host + '/cms/boot/images/delete', // 图片管理-删除

			informationGetList: this.host + '/cms/boot/information/informations', //资讯管理-订单列表
			informationAdd: this.host + '/cms/boot/information/add', //资讯管理-新增资讯
			informationDelete: this.host + '/cms/boot/information/delete', //资讯管理-删除资讯
			informationInfo: this.host + '/cms/boot/information/informationInfo', //资讯管理-资讯详情
			informationEdit: this.host + '/cms/boot/information/edit', //资讯管理-资讯修改
			informationReview: this.host + '/cms/boot/information/review', //资讯管理-审核资讯
			informationPubilsh: this.host + '/cms/boot/information/publish', //资讯管理-发布资讯
			informationTypeList: this.host + '/cms/boot/information/informationTypeList', //资讯管理-资讯类型查询
			sortInfoTypeUp: this.host + '/cms/boot/information/sortInfoTypeUp', //资讯管理-资讯类型排序--上移
			sortInfoTypeDown: this.host + '/cms/boot/information/sortInfoTypeDown', //资讯管理-资讯类型排序--下移
			addInformationType: this.host + '/cms/boot/information/addInformationType', //资讯管理-新增资讯类型
			delInformationType: this.host + '/cms/boot/information/delInformationType', //资讯管理-删除资讯类型
			infoTypeSelect: this.host + '/cms/boot/information/infoTypeSelect', //资讯管理-资讯类型下拉列表
			dealInfoTypeStatus: this.host + '/cms/boot/information/dealInfoTypeStatus', //资讯管理-资讯类型--启用/关闭
			informationIsHome: this.host + '/cms/boot/information/isHome', //资讯管理-资讯类型--首页推荐
			informationOff: this.host + '/cms/boot/information/informationOff', //资讯管理-资讯下架
			isHasInfo: this.host + '/cms/boot/information/isHasInfo', //资讯管理-资讯类型是否包含有资讯信息
			infoTypeNameIsSame: this.host + '/cms/boot/information/infoTypeNameIsSame', //资讯管理-资讯类型是否有相同

			activityQuery: this.host + '/cms/boot/activity/activityQuery', //活动管理-列表查询
			activityAdd: this.host + '/cms/boot/activity/addActivity', //活动管理-新增活动
			activityInfo: this.host + '/cms/boot/activity/getActivity', //活动管理-活动详情
			activityReview: this.host + '/cms/boot/activity/activityReview', //活动管理-活动审核
			activityPubilsh: this.host + '/cms/boot/activity/activityPubilsh', //活动管理-活动上架/下架
			activityEdit: this.host + '/cms/boot/activity/editActivity', //活动管理-活动编辑
			activitydel: this.host + '/cms/boot/activity/activityDel', //活动管理-活动删除
			isHasPublished: this.host + '/cms/boot/activity/isHasPublishedSameLocation', //活动管理-是否包含有相同位置的活动已经上架

			versionQuery: this.host + '/cms/boot/version/versionQuery', //版本管理-列表查询
			versionAdd: this.host + '/cms/boot/version/addVersion', //版本管理-新增版本
			versionInfo: this.host + '/cms/boot/version/getVersion', //版本管理-版本详情
			versionReview: this.host + '/cms/boot/version/versionReview', //版本管理-版本审核
			versionPubilsh: this.host + '/cms/boot/version/versionPubilsh', //版本管理-版本上架/下架
			versionEdit: this.host + '/cms/boot/version/editVersion', //版本管理-版本编辑
			getVersionNoByIncrement: this.host + '/cms/boot/version/getVersionNoByIncrement', //版本管理-获取增量版本号
			getVersionNoByVersion: this.host + '/cms/boot/version/getVersionNoByVersion', //版本管理-获取升级版本号
			versionDelete: this.host + '/cms/boot/version/versionDelete', //版本管理-版本删除
			isHasSameVersion: this.host + '/cms/boot/version/isHasSameVersion', //版本管理-版本重复判断

			pushQuery: this.host + '/cms/boot/push/pushQuery', //推送管理-列表查询
			pushAdd: this.host + '/cms/boot/push/addPush', //推送管理-新增推送
			pushInfo: this.host + '/cms/boot/push/getPush', //推送管理-推送详情
			pushReview: this.host + '/cms/boot/push/pushReview', //推送管理-推送审核
			pushPubilsh: this.host + '/cms/boot/push/pushPubilsh', //推送管理-推送上架
			pushEdit: this.host + '/cms/boot/push/editPush', //推送管理-推送编辑
			delPush: this.host + '/cms/boot/push/delPush', //推送管理-推送删除
			isHasSamePushTitle: this.host + '/cms/boot/push/isHasSamePushTitle', //推送管理-推送标题重复判断
			findRedisExecuteLogEntity: this.host + '/mimosa/boot/cache/findRedisExecuteLogEntity', //redis执行日志
			findCouponLog: this.host + '/mimosa/boot/couponLog/findCouponLog', //体验金投资日志
			
			checkDataList : this.host + '/mimosa/platform/finance/check/mng', //对账查询接口
			synCompareData : this.host + '/mimosa/platform/finance/data/rdata', //同步对账数据
			checkOrder : this.host + '/mimosa/platform/finance/orders/check', //对账
			checkDataConfirm : this.host + '/mimosa/platform/finance/orders/lorders', //对账数据确认
			checkResultList : this.host + '/mimosa/platform/finance/result/crmng',  //查询对账结果数据
			modifyOrderList : this.host + '/mimosa/platform/finance/modifyorder/modifyOrderList',  //查询补帐数据
			saveModifyOrder : this.host + '/mimosa/platform/finance/modifyorder/saveModifyOrder',  //新增补帐数据
			modifyOrderApprove : this.host + '/mimosa/platform/finance/modifyorder/modifyOrderApprove', //补帐审核
			checkAbandon : this.host + '/mimosa/boot/tradeorder/check/abandon', //废单操作
			checkRefund : this.host + '/mimosa/boot/tradeorder/check/refund', //退款
			rsinvest : this.host + '/mimosa/boot/tradeorder/check/rsinvest', //补单投资单
			rsredeem : this.host + '/mimosa/boot/tradeorder/check/rsredeem', //补单赎回单
			modifyOrderBatchApprove : this.host + '/mimosa/platform/finance/modifyorder/modifyOrderBatchApprove',
			idepositlong : this.host + '/mimosa/boot/investor/bankorder/depositlong', //投资人充值长款
			idepositshort : this.host + '/mimosa/boot/investor/bankorder/depositshort', //投资人充值短款
			iwithdrawlong : this.host + '/mimosa/boot/investor/bankorder/withdrawlong', //投资人提现长款
			iwithdrawshort : this.host + '/mimosa/boot/investor/bankorder/withdrawshort', //投资人提现短款
			iredenvelopeshort : this.host + '/mimosa/boot/investor/bankorder/redenvelopeshort', //投资人红包短款
			pdepositlong : this.host + '/mimosa/boot/publisher/bankorder/depositlong', //发行人充值长款
			pdepositshort : this.host + '/mimosa/boot/publisher/bankorder/depositshort', //发行人充值短款
			pwithdrawlong : this.host + '/mimosa/boot/publisher/bankorder/withdrawlong', //发行人提现长款
			pwithdrawshort : this.host + '/mimosa/boot/publisher/bankorder/withdrawshort', //发行人提现短款
			inotifyok : this.host + '/mimosa/boot/investor/bankorder/notifyok', //投资人回调成功
			inotifyfail : this.host + '/mimosa/boot/investor/bankorder/notifyfail', //投资人回调失败
			pnotifyok : this.host + '/mimosa/boot/publisher/bankorder/notifyok', //发行人回调成功
			pnotifyfail : this.host + '/mimosa/boot/publisher/bankorder/notifyfail' //发行人回调失败
			
			
			
		},

		/**
		 * 非现金标的state
		 */
		repaymentstarts: [{
			id: "MOONSTART",
			text: "月初"
		}, {
			id: "MOONEND",
			text: "月末"
		}],
		/**
		 * 非现金标的lifeState查询
		 */
		illiquidAssetLifeStatesCondition: [{
			id: "INIT",
			text: "初始化"
		}, {
			id: "B4_COLLECT",
			text: "未开始募集"
		}, {
			id: "COLLECTING",
			text: "募集期"
		}, {
			id: "OVER_COLLECT",
			text: "募集结束"
		}, {
			id: "SETUP",
			text: "成立"
		}, {
			id: "UNSETUP",
			text: "未成立"
		}, {
			id: "VALUEDATE",
			text: "起息"
		}, {
			id: "OVER_VALUEDATE",
			text: "到期"
		}, {
			id: "REPAYMENTS",
			text: "本息兑付"
		}, {
			id: "OVERDUE",
			text: "逾期"
		}, {
			id: "OVERDUE_REPAYMENTS",
			text: "逾期兑付"
		}, {
			id: "OVERDUE_TRANSFER",
			text: "逾期转让"
		}, {
			id: "OVERDUE_CANCELLATION",
			text: "逾期坏账核销"
		}, {
			id: "TRANSFER",
			text: "转让"
		}, {
			id: "CANCELLATION",
			text: "坏账核销"
		}, {
			id: "SETUP_FAIL",
			text: "成立失败"
		}],
		/**
		 * 非现金标的state
		 */
		illiquidAssetStates: [{
			id: "CREATE",
			text: "新建"
		}, {
			id: "AUDITING",
			text: "审核中"
		}, {
			id: "PASS",
			text: "审核通过"
		}, {
			id: "REJECT",
			text: "驳回"
		}],
		/**
		 * 非现金标的state查询
		 */
		illiquidAssetStatesCondition: [{
			id: "CREATE",
			text: "新建"
		}, {
			id: "AUDITING",
			text: "审核中"
		}, {
			id: "PASS",
			text: "审核通过"
		}, {
			id: "REJECT",
			text: "驳回"
		}],

		/**
		 * targetStates 标的状态
		 */
		targetStates: [{
			id: "waitPretrial",
			text: "未审核",
			children: []
		}, {
			id: "pretrial",
			//text: "预审中",
			text: "审核中",
			children: []
		}, {
			id: "waitMeeting",
			text: "未过会",
			children: []
		}, {
			id: "metting",
			text: "过会中",
			children: []
		}, {
			id: "collecting",
			//			text: "过会完成",
			text: "审核通过",
			children: []
		}, {
			id: "establish",
			text: "成立",
			children: []
		}, {
			id: "unEstablish",
			text: "成立失败",
			children: []
		}, {
			id: "reject",
			//text: "驳回",
			text: "审核驳回",
			children: []
		}, {
			id: "overdue",
			text: "逾期",
			children: []
		}, {
			id: "normalIncome",
			text: "正常兑付",
			children: []
		}, {
			id: "overdueIncome",
			text: "逾期兑付",
			children: []
		}, {
			id: "invalid",
			text: "作废",
			children: []
		}, {
			id: "metted",
			//text: "过会完成",
			text: "审核通过",
			children: []
		}, {
			id: "meetingPass",
			text: "已入池"
		}],
		/**
		 * targetStates 标的状态
		 */
		targetStatesCondition: [{
			id: "waitPretrial",
			text: "未审核",
			children: []
		}, {
			id: "pretrial",
			text: "预审中",
			children: []
		}, {
			id: "waitMeeting",
			text: "未过会",
			children: []
		}, {
			id: "metting",
			text: "过会中",
			children: []
		}, {
			id: "metted",
			//text: "过会完成",
			text: "审核通过",
			children: []
		}, {
			id: "reject",
			text: "驳回",
			children: []
		}],
		/**
		 * 标的生命周期
		 */
		targetLifeStates: [{
			id: "PREPARE",
			text: "准备期",
			children: []
		}, {
			id: "STAND_UP",
			text: "已成立",
			children: []
		}, {
			id: "STAND_FAIL",
			text: "成立失败",
			children: []
		}, {
			id: "CLOSE",
			text: "已结束",
			children: []
		}, {
			id: "OVER_TIME",
			text: "已逾期",
			children: []
		}, {
			id: "RETURN_BACK",
			text: "已逾期",
			children: []
		}, {
			id: "PAY_BACK",
			text: "兑付期",
			children: []
		}, ],
		/**
		 * 标的生命周期(搜索用)
		 */
		targetLifeStatesForForm: [{
			id: "PREPARE",
			text: "准备期",
			children: []
		}, {
			id: "STAND_UP",
			text: "已成立",
			children: []
		}, {
			id: "STAND_FAIL",
			text: "成立失败",
			children: []
		}, {
			id: "CLOSE",
			text: "已结束",
			children: []
		}, {
			id: "OVER_TIME",
			text: "已逾期",
			children: []
		}, {
			id: "RETURN_BACK",
			text: "已逾期兑付",
			children: []
		}, {
			id: "PAY_BACK",
			text: "兑付期",
			children: []
		}, ],
		/**
		 * conventionStates 过会状态
		 */
		conventionStates: [

		],
		cashtoolStates: [{
			id: "waitPretrial",
			text: "未审核",
			children: []
		}, {
			id: "pretrial",
			text: "审核中",
			children: []
		}, {
			id: "collecting",
			text: "募集期",
			children: []
		}, {
			id: "reject",
			text: "驳回",
			children: []
		}, {
			id: "invalid",
			text: "作废",
			children: []
		}, { // 目前本状态无效,统一使用invalid
			id: "delete",
			text: "已删除",
			children: []
		}],
		cashtoolStatesView: [{
			id: "waitPretrial",
			text: "未审核",
			children: []
		}, {
			id: "pretrial",
			text: "审核中",
			children: []
		}, {
			id: "collecting",
			text: "募集期",
			children: []
		}, {
			id: "reject",
			text: "驳回",
			children: []
		}],
		/*
		 * 是否下拉列表
		 */
		booleanSelect: [{
			id: "Y",
			text: "是",
			children: []
		}, {
			id: "N",
			text: "否",
			children: []
		}],
		meetingStates: [{
			id: "notopen",
			text: "未启动",
			children: []
		}, {
			id: "opening",
			text: "启动中",
			children: []
		}, {
			id: "stop",
			text: "暂停",
			children: []
		}, {
			id: "finish",
			text: "完成",
			children: []
		}],
		voteStates: [{
			id: "notvote",
			text: "未表决",
			children: []
		}, {
			id: "approve",
			text: "赞成",
			children: []
		}, {
			id: "notapprove",
			text: "不赞成",
			children: []
		}, {
			id: "notpass",
			text: "一票否决",
			children: []
		}],
		//接入类型
		joinTypes: [{
			id: "ftp",
			text: "FTP文件",
		}, {
			id: "api",
			text: "API接口",
		}],
		//渠道状态
		channelStatus: [{
			id: "on",
			text: "已启用",
		}, {
			id: "off",
			text: "已停用",
		}],
		//删除状态
		delStatus: [{
			id: "yes",
			text: "已删除",
		}, {
			id: "no",
			text: "正常",
		}],
		//请求类型
		requestTypes: [{
			id: "on",
			text: "启用",
		}, {
			id: "off",
			text: "停用",
		}],
		//审批结果
		approveStatus: [{
			id: "pass",
			text: "<p class='text-green'>通过</p>",
		}, {
			id: "refused",
			text: "<p class='text-red'>驳回</p>",
		}, {
			id: "toApprove",
			text: "<p class='text-yellow'>待审批</p>",
		}],
		
//		//审批结果
//		approveStatus: [{
//			id: "pass",
//			text: "通过",
//		}, {
//			id: "refused",
//			text: "驳回",
//		}, {
//			id: "toApprove",
//			text: "待审批",
//		}],
		//标的期限单位
		lifeUnit: [{
			id: "day",
			text: "日",
		}, {
			id: "month",
			text: "月",
		}, {
			id: "year",
			text: "年",
		}],
		//付息周期方式
		accrualCycleType: [{
			id: "NATURAL_YEAR",
			text: "自然年",
		}, {
			id: "CONTRACT_YEAR",
			text: "合同年",
		}],
		//主体评级
		subjectRating: [{
			id: "R1",
			text: "R1 - 谨慎型",
		}, {
			id: "R2",
			text: "R2 - 稳健型",
		}, {
			id: "R3",
			text: "R3 - 平衡型",
		}, {
			id: "R4",
			text: "R4 - 进取型",
		}, {
			id: "R5",
			text: "R5 - 激进型",
		}],
		incomeSchedule: [{
				id: "DAY",
				text: "日结",
			}
			/*, {
			      id: "MONTH",
			      text: "月结",
			    }*/
		],
		/**
		 * 风险处置
		 */
		warningHandleType: [{
			id: "KEEP",
			text: "保留风险等级",
		}, {
			id: "CLEAR",
			text: "风险已处置",
		}, {
			id: "DOWN",
			text: "风险降级",
		}],
		accountType: [{ // 持有人类型
			id: "SPV",
			text: "发行人",
		}, {
			id: "INVESTOR",
			text: "投资人",
		}],
		investorOrderType: [{ // 持有人订单交易类型
			id: "INVEST",
			text: "申购",
		}, {
			id: "REDEEM",
			text: "赎回",
		}, {
			id: "BUY_IN",
			text: "买入",
		}, {
			id: "PART_SELL_OUT",
			text: "部分卖出",
		}, {
			id: "FULL_SELL_OUT",
			text: "全部卖出",
		}],
		investorOrderCate: [{ // 持有人订单Cate
			id: "TRADE",
			text: "交易订单",
		}, {
			id: "STRIKE",
			text: "冲账订单",
		}],
		investorOrderStatus: [{ // 持有人订单状态
			id: "SUBMIT",
			text: "未确认",
		}, {
			id: "CONFIRM",
			text: "确认",
		}, {
			id: "DISABLE",
			text: "失败",
		}, {
			id: "CALCING",
			text: "清算中",
		}],
		investorOrderEntryStatus: [{ // 持有人订单入账状态
			id: "NO",
			text: "未入账",
		}, {
			id: "YES",
			text: "已入账",
		}],
		riskLevel: [{ // 持有人订单入账状态
			id: "LOW",
			text: "低",
		}, {
			id: "MID",
			text: "中",
		}, {
			id: "HIGH",
			text: "高",
		}],
		uaccountStatus: [{ //个人用户状态
			id: "normal",
			text: "正常",
		}, {
			id: "forbidden",
			text: "已锁定",
		}],
		productTypes: [{ //产品类型
			id: "t0",
			text: "活期",
		}, {
			id: "tn",
			text: "定期",
		}],
		
		checkProductType: [{ //产品类型
			id: "PRODUCTTYPE_01",
			text: "定期",
		}, {
			id: "PRODUCTTYPE_02",
			text: "活期",
		}],
		//上下架状态
		releaseStatus: [{
			id: 'wait',
			text: "<p class='text-yellow'>待上架</p>",
		}, {
			id: 'ok',
			text: "<p class='text-green'>已上架</p>",
		}, {
			id: 'no',
			text: "<p class='text-red'>已下架</p>",
		}],
		//活动状态
		activityStatus: [{
			id: 'on',
			text: "已上架",
		}, {
			id: 'off',
			text: "已下架",
		}, {
			id: 'pending',
			text: "待审核",
		}, {
			id: 'reviewed',
			text: "已审核",
		}, {
			id: 'reject',
			text: "已驳回",
		}],
		//首页推荐状态
		pageStatus: [{
			id: 'is',
			text: "是",
		}, {
			id: 'no',
			text: "否",
		}],
		//置顶状态
		topStatus: [{
			id: '1',
			text: "是",
		}, {
			id: '2',
			text: "否",
		}],
		//置顶状态 --资讯
		topInfoStatus: [{
			id: 1,
			text: "是",
		}, {
			id: 0,
			text: "否",
		}],
		//推送类型
		pushType: [{
			id: 'activity',
			text: "活动",
		}, {
			id: 'information',
			text: "资讯",
		}, {
			id: 'notice',
			text: "公告",
		}, {
			id: 'HQ',
			text: "活期",
		}, {
			id: 'DQ',
			text: "定期",
		}, {
			id: 'mail',
			text: "站内信",
		}],
		//推送状态
		pushStatus: [{
			id: 'on',
			text: "已推送",
		}, {
			id: 'reviewed',
			text: "已审核",
		}, {
			id: 'pending',
			text: "待审核",
		}, {
			id: 'reject',
			text: "已驳回",
		}],
		//资讯状态
		informationStatus: [{
			id: 'off',
			text: "已下架",
		}, {
			id: 'published',
			text: "已发布",
		}, {
			id: 'publishing',
			text: "待发布",
		}, {
			id: 'pending',
			text: "待审核",
		}, {
			id: 'reject',
			text: "已驳回",
		}],
		//版本类型
		versionSystemType: [{
			id: 'ios',
			text: "ios",
		}, {
			id: 'android',
			text: "安卓",
		}, {
			id: 'increment',
			text: "增量",
		}],
		//活动状态
		versionStatus: [{
			id: 'on',
			text: "已发布",
		}, {
			id: 'pending',
			text: "待审核",
		}, {
			id: 'reviewed',
			text: "待发布",
		}, {
			id: 'reject',
			text: "已驳回",
		}],
		//链接类型
		linkTypes: [{
			id: 0,
			text: "链接",
		}, {
			id: 1,
			text: "跳转",
		}],
		//页面跳转类型
		pageTypes: [{
			id: 'T1',
			text: "活期",
		}, {
			id: 'T2',
			text: "定期",
		}, {
			id: 'T3',
			text: "注册",
		}],
		//活动位置
		locationTypes: [{
			id: 'left',
			text: "左边",
		}, {
			id: 'right',
			text: "右边",
		}, {
			id: 'carousel',
			text: "通栏",
		}, {
			id: 'mypage',
			text: "我的页面活动",
		}],
		//意见反馈处理状态
		dealTypes: [{
			id: 'ok',
			text: "已处理",
		}, {
			id: 'no',
			text: "未处理",
		}],
		//活动跳转的页面类型
		activityPageTypes: [{
			id: 'newcomer',
			text: "新手",
		}, {
			id: 'seckill',
			text: "秒杀",
		}],
		/**
		 * 图表所用到的主题颜色
		 */
		colors: ['#3c8dbc', '#dd4b39', '#f39c12', '#00a65a', '#00c0ef', '#605ca8', '#ff851b', '#39cccc'],

		/**
		 * 日志查询区间
		 */
		dateInterval: [{
			id: 'Denges',
			text: '当日',
		}, {
			id: 'week',
			text: '最近一周',
		}, {
			id: 'month',
			text: '最近一个月',
		}, {
			id: 'quarter',
			text: '最近三个月',
		}, {
			id: 'year',
			text: '最近一年',
		}, {
			id: 'all',
			text: '全部',
		}],
		//计息状态
		accrualStatus: [{
			id: 'yes',
			text: "正在计息",
		}, {
			id: 'no',
			text: "尚未计息",
		}],

		/**
		 * 身份证号加权因子
		 */
		wi: [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],

		/**
		 * 身份证号验证位值
		 */
		valideCode: ['1', '0', '10', '9', '8', '7', '6', '5', '4', '3', '2'],

		/**
		 * 身份证号省份
		 */
		idCity: {
			11: "北京",
			12: "天津",
			13: "河北",
			14: "山西",
			15: "内蒙古",
			21: "辽宁",
			22: "吉林",
			23: "黑龙江",
			31: "上海",
			32: "江苏",
			33: "浙江",
			34: "安徽",
			35: "福建",
			36: "江西",
			37: "山东",
			41: "河南",
			42: "湖北",
			43: "湖南",
			44: "广东",
			45: "广西",
			46: "海南",
			50: "重庆",
			51: "四川",
			52: "贵州",
			53: "云南",
			54: "西藏",
			61: "陕西",
			62: "甘肃",
			63: "青海",
			64: "宁夏",
			65: "新疆",
			71: "台湾",
			81: "香港",
			82: "澳门",
			91: "国外"
		},
		target_type: function() {
			var types = {
				信托类: {
					TARGETTYPE_05: '券商资管计划',
					TARGETTYPE_06: '基金/基金子公司资管计划',
					TARGETTYPE_07: '保险资管计划',
					TARGETTYPE_04: '信托计划-房地产类',
					TARGETTYPE_03: '信托计划-政信类',
					TARGETTYPE_12: '信托计划-工商企业类',
					TARGETTYPE_13: '信托计划-金融产品投资类',
					TARGETTYPE_01: '证券类',
					TARGETTYPE_02: '股权投资类',
					TARGETTYPE_14: '银行理财类'
				},
				票据类: {
					TARGETTYPE_16: '商票',
					TARGETTYPE_15: '银票'
				},
				消费金融类: {
					TARGETTYPE_17: '现金贷',
					TARGETTYPE_18: '消费分期'
				},
				其他: {
					TARGETTYPE_19: '供应链金融产品类',
					TARGETTYPE_20: '房抵贷',
					TARGETTYPE_08: '债权及债权收益类'
				}
			}

			return types;

		},

		target_lifeState: function() {
			var states = {
				"B4_COLLECT": '未开始募集',
				"COLLECTING": '募集中',
				"OVER_COLLECT": '募集结束',
				"UNSETUP": '未成立',
				"SETUP": '已成立',
				"VALUEDATE": '存续期',
				"OVER_VALUEDATE": '已到期',
				"REPAYMENTS": '已兑付',
				"OVERDUE": '已逾期',
				"OVERDUE_REPAYMENTS": '已逾期兑付',
				"OVERDUE_TRANSFER": '已逾期转让',
				"OVERDUE_CANCELLATION": '已逾期坏账核销',
				"TRANSFER": '已转让',
				"CANCELLATION": '已坏账核销'
			}
			this.getStates = function() {
				return states;
			}
			this.getStateName = function(state) {
				var stateName = null;
				if (state) {
					stateName = states[state];
				} else {
					throw "参数错误.";
				}
				if (stateName) {
					return stateName;
				}
				throw "无法识别的标的状态: " + state;
			}
			return this;
		},

		init_target_type: function(combobox, showall) {
			var assetTypes = _this.target_type();
			var options = {}
			$.each(assetTypes, function(key) {
				var list = [];
				$.each(assetTypes[key], function(code) {
					list.push({
						code: code,
						name: assetTypes[key][code]
					})
				});
				options[key] = list;
			})

			if (showall) {
				$('<option value="">全部</option>').appendTo(combobox);
			}
			$.each(options, function(k, v) {
				var group = $('<optgroup label="' + k + '"></optgroup>');
				$.each(v, function(o) {
					$('<option value="' + v[o].code + '">' + v[o].name + '</option>').appendTo(group);
				});
				group.appendTo(combobox);
			});

		},
		//对账状态
		checkStatus: [{
			id: "toCheck",
			text: "待对账",
		}, {
			id: "checking",
			text: "对账中",
		}, {
			id: "checkSuccess",
			text: "对账成功",
		}, {
			id: "checkFailed",
			text: "对账失败",
		}],
		//对账确认状态
		checkConfirmStatus: [{
			id: "yes",
			text: "已确认",
		}, {
			id: "no",
			text: "待确认",
		}],
		//对账数据同步状态
		checkDataSyncStatus: [{
			id: "toSync",
			text: "待同步",
		}, {
			id: "syncFailed",
			text: "同步失败",
		}, {
			id: "syncOK",
			text: "同步成功",
		}, {
			id: "syncing",
			text: "同步中",
		}],
		//订单类型
		orderType: [{
			id: "reInvest",
			text: "补申购",
		}, {
			id: "reRedeem",
			text: "补赎回",
		}, {
			id: "invest",
			text: "申购",
		}, {
			id: "redeem",
			text: "赎回",
		}, {
			id: "normalRedeem",
			text: "赎回",
		}, {
			id: "deposit",
			text: "充值",
		}, {
			id: "withdraw",
			text: "提现",
		}, {
			id: "offsetPositive",
			text: "冲正",
		}, {
			id: "offsetNegative",
			text: "冲负",
		}, {
			id: "redEnvelope",
			text: "红包",
		}, {
			id: "clearRedeem",
			text: "清盘",
		}, {
			id: "cash",
			text: "还本/付息",
		}, {
			id: "cashFailed",
			text: "募集失败退款",
		}],
		//对账结果状态
		checkResultStatus: [{
			id: "moreThen",
			text: "多帐",
		}, {
			id: "lessThen",
			text: "少帐",
		}, {
			id: "equals",
			text: "一致",
		}, {
			id: "exception",
			text: "异常",
		}],
		//对账订单状态
		checkOrderStatus: [{
			id: "0",
			text: "处理中",
		}, {
			id: "1",
			text: "交易成功",
		}, {
			id: "2",
			text: "交易失败",
		}, {
			id: "3",
			text: "撤销",
		}],
		//订单状态
		orderStatus: [{
			id: "0",
			text: "失败",
		},{
			id: "1",
			text: "成功",
		},{
			id: "submitted",
			text: "已申请",
		}, {
			id: "refused",
			text: "已拒绝",
		}, {
			id: "toPay",
			text: "待支付",
		}, {
			id: "payFailed",
			text: "支付失败",
		}, {
			id: "paySuccess",
			text: "支付成功",
		}, {
			id: "payExpired",
			text: "支付超时",
		}, {
			id: "accepted",
			text: "已受理",
		}, {
			id: "confirmed",
			text: "份额已确认",
		}, {
			id: "done",
			text: "交易成功",
		}, {
			id: "refunded",
			text: "已退款",
		}, {
			id: "abandoned",
			text: "已作废",
		},, {
			id: "submitFailed",
			text: "申请失败",
		}],
		//对账审核状态
		checkApproveStatus: [{
			id: "toApprove",
			text: "待审核",
		}, {
			id: "pass",
			text: "通过",
		}, {
			id: "refused",
			text: "驳回",
		}],
		//对账操作状态
		checkOpType: [{
			id: "removeOrder",
			text: "废单",
		}, {
			id: "fixOrder",
			text: "补单",
		}, {
			id: "exception",
			text: "异常订单",
		}],
		//处理状态
		dealStatus: [{
			id: "toDeal",
			text: "待处理",
		}, {
			id: "dealing",
			text: "处理中",
		}, {
			id: "dealt",
			text: "已处理",
		}],
		//元素是否显示
		isDisplays: [{
			id: "yes",
			text: "显示",
		}, {
			id: "no",
			text: "关闭",
		}],
		//元素类型
		elementTypes: [{
			id: "button",
			text: "按钮",
		}, {
			id: "link",
			text: "链接",
		}, {
			id: "data",
			text: "数据",
		}],
		// 站内信类型
		mailTypes: [{
			id: "all",
			text: "全站信息",
		}, {
			id: "person",
			text: "个人信息",
		}],
		// 站内信内容类型
		mesTypes: [{
			id: "system",
			text: "系统信息",
		}, {
			id: "person",
			text: "个人信息",
		}, {
			id: "all",
			text: "全站信息",
		}],
		// 站内信状态
		mailStatus: [{
			id: "toApprove",
			text: "待审核",
		}, {
			id: "pass",
			text: "已发送",
		}, {
			id: "refused",
			text: "已驳回",
		}, {
			id: "delete",
			text: "已删除",
		}],
		// 站内信类型
		pushTypes: [{
			id: "all",
			text: "全站推送",
		}, {
			id: "person",
			text: "个人推送",
		}],
		//系统级开关审核状态
		switchStatus: [{
			id: "toApprove",
			text: "待审核",
		}, {
			id: "pass",
			text: "已通过",
		}, {
			id: "refused",
			text: "已驳回",
		}, {
			id: "enable",
			text: "已启用",
		}, {
			id: "disable",
			text: "已禁用",
		}],
		//系统级开关白名单状态
		switchWhiteStatus: [{
			id: "white",
			text: "启用白名单",
		}, {
			id: "black",
			text: "启用黑名单",
		}, {
			id: "no",
			text: "未启用",
		}],
		//系统配置类型
		switchTypes: [{
			id: "switch",
			text: "开关",
		}, {
			id: "configure",
			text: "参数",
		}],
		//交易日志状态
		tradeCalendarTypes: [{
			id: 1,
			text: "是",
		}, {
			id: 0,
			text: "否",
		}],
		//收益分期状态
		incomeTranCycleType: [{
			id: "month",
			text: "每月",
//		}, {
//			id: "quarter",
//			text: "每季度",
//		}, {
//			id: "halfayear",
//			text: "每半年",
//		}, {
//			id: "year",
//			text: "每年",
		}],
		//合作伙伴状态
		commonTypes: [{
			id: "is",
			text: "是",
		}, {
			id: "no",
			text: "否",
		}],
		//定时任务日志状态
		jobLogStatus: [{
			id: "success",
			text: "成功",
		}, {
			id: "failed",
			text: "失败",
		}],
		//定时任务日志状态
		jobStatus: [{
			id: "toRun",
			text: "可执行",
		}, {
			id: "processing",
			text: "执行中",
		}],
		// 资产池收益排期状态
		incomeScheduleStatus: [{
			id: "toApprove",
			text: "待审核",
		}, {
			id: "pass",
			text: "待执行",
		}, {
			id: "finish",
			text: "已完成",
		}, {
			id: "fail",
			text: "失败",
		}, {
			id: "lose",
			text: "已失效",
		}],
		// 资产池收益排期申请状态
		incomeScheduleApplyStatus: [{
			id: "toApprove",
			text: "待审核",
		}, {
			id: "pass",
			text: "通过",
		}, {
			id: "reject",
			text: "驳回",
		}, {
			id: "lose",
			text: "已失效",
		}],
		// 资产池收益排期申请操作类型
		incomeScheduleApplyTypes: [{
			id: "new",
			text: "新建",
		}, {
			id: "update",
			text: "修改",
		}, {
			id: "delete",
			text: "删除",
		}],
		// 收益处理方式
		incomeDealTypes: [{
			id: "reinvest",
			text: "结转",
		}, {
			id: "cash",
			text: "现金分红",
		}]
		

	};
	this._this = result;
	return result;
})
