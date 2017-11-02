/**
 * ajax请求全局封装，集中进行errorCode处理
 * amd模块，使用requirejs载入
 */

var forbiddenUrls=[
"/mimosa/boot/investmentPool/establish",//标的成立
"/mimosa/boot/investmentPool/unEstablish",//标的不成立
"/mimosa/boot/investmentPool/overdue",//标的逾期
"/mimosa/boot/investmentPool/close",//标的结束
"/mimosa/boot/investmentPool/incomeSave",//投资标的本息兑付
"/mimosa/boot/investmentPool/overdueN",//投资标的逾期
"/mimosa/boot/investmentPool/incomeSaveN",//投资标的本息正常兑付
"/mimosa/boot/investmentPool/incomeSaveD",//投资标的本息逾期兑付
"/mimosa/boot/investmentPool/targetCancel",//投资标的坏账核销
"/mimosa/boot/investmentPool/overdueTransfer",//投资标的本息逾期转让
"/mimosa/boot/cashToolPool/remove",//现金管理工具移除出库
"/mimosa/boot/cashToolPool/revenueSave",//现金管理工具收益采集
"/mimosa/boot/investmentPool/targetIncomeSave",//投资标的本息兑付
"/mimosa/boot/project/deleteProject",//删除投资标的下的底层项目
"/mimosa/boot/project/save",//保存底层项目
"/mimosa/target/targetManage/add",//新建标的
"/mimosa/target/targetManage/edit",//编辑标的
"/mimosa/target/targetManage/examine",//标的提交预审
"/mimosa/target/targetManage/invalid",//标的作废
"/mimosa/target/targetManage/enter",//标的确认
"/mimosa/target/targetCheck/checkpass",//标的预审通过
"/mimosa/target/targetCheck/checkreject",//标的预审驳回
"/mimosa/product/save/periodic",//新加定期产品
"/mimosa/product/save/current",//新加活期产品
"/mimosa/product/update/periodic",//更新定期产品
"/mimosa/product/update/current",//更新活期产品
"/mimosa/product/delete",//产品作废
"/mimosa/product/aduit/apply",//产品审核申请
"/mimosa/product/aduit/reject",//产品审核不通过
"/mimosa/product/aduit/approve",//产品审核通过
"/mimosa/product/review/reject",//产品复核不通过
"/mimosa/product/review/approve",//产品复核通过
"/mimosa/product/channel/upshelf",//上架产品
"/mimosa/product/channel/donwshelf",//下架产品
"/mimosa/boot/cashTool/add",//新建现金管理类工具
"/mimosa/boot/cashTool/examine",//现金管理类工具提交审核
"/mimosa/boot/cashTool/invalid",//现金管理类工具作废
"/mimosa/boot/cashTool/checkpass",//现金管理类工具审核通过
"/mimosa/boot/cashTool/checkreject",//现金管理类工具审核驳回
"/mimosa/boot/cashTool/edit",//现金管理类工具编辑
"/mimosa/target/targetMeeting/addMeeting",//新建过会
"/mimosa/target/targetMeeting/summaryUp",//上传会议纪要
"/mimosa/target/targetMeeting/open",//启动会议
"/mimosa/target/targetMeeting/stop",//暂停会议
"/mimosa/target/targetMeeting/summaryDetele",//删除会议纪要
"/mimosa/target/targetMeeting/finish",//会议完成
"/mimosa/target/targetManage/confirmCheckList",//过会标的检查项确认
"/mimosa/channel/add",//渠道-新增
"/mimosa/channel/edit",//渠道-修改
"/mimosa/channel/delete",//渠道-删除
"/mimosa/channel/setapply",//渠道-申请开启停用
"/mimosa/channelapprove/dealapply",//渠道-处理申请开启和停用
"/mimosa/target/targetVote/vote",//过会标的表决
"/mimosa/boot/publisher/baseaccount/open",//发行人账户-开通企业账户
"/mimosa/corporate/lockin",//发行人账户-锁定企业账户
"/mimosa/corporate/create",//发行人账户-新建发行人
"/mimosa/boot/investor/baseaccount/lockuser",//个人用户-锁定/解锁用户
//"/mimosa/boot/publisher/bankorder/mng",//发行人轧差-银行转账
//"/mimosa/boot/publisheroffset/mnguid",//发行人轧差-日结
"/mimosa/boot/publisher/bankorder/withdraw",//发行人轧差-提现
"/mimosa/boot/publisher/bankorder/deposit",//发行人轧差-充值
"/mimosa/boot/investoroffset/iclear",//投资人轧差-普通轧差清算
"/mimosa/boot/investoroffset/iclose",//投资人轧差-普通轧差结算
"/mimosa/boot/investoroffset/fclose",// 投资人轧差-快速轧差结算
"/mimosa/boot/platform/reservedaccount/collectsuper",//超级用户借款
"/mimosa/boot/platform/reservedaccount/paysuper",//超级用户还款
"/mimosa/boot/platform/reservedaccount/collectbasic",//基本用户借款
"/mimosa/boot/platform/reservedaccount/paybasic",//基本用户还款
"/mimosa/boot/platform/baseaccount/pay",//超级户还款给基本户
"/mimosa/boot/platform/baseaccount/borrow",//基本户借款给超级户
"/mimosa/boot/tradeorder/superredeem",//平台账户-赎回
"/mimosa/file/pkg",//获得下载key
"/mimosa/file/dl?key=",//下载附件包参数key
"/mimosa/acct/account/update",//修改会计科目
"/mimosa/system/ccp/warrantor/create",//新建担保对象权数
"/mimosa/system/ccp/warrantor/update",//修改担保对象权数
"/mimosa/system/ccp/warrantor/delete",//删除担保对象权数配置
"/mimosa/system/ccp/warrantyMode/create",//新建担保方式权数
"/mimosa/system/ccp/warrantyMode/update",//修改担保方式权数
"/mimosa/system/ccp/warrantyMode/delete",//删除担保方式数配置
"/mimosa/system/ccp/warrantyExpire/create",//新建担保期限权数
"/mimosa/system/ccp/warrantyExpire/update",//修改担保期限权数
"/mimosa/system/ccp/warrantyExpire/delete",//删除担保期限权数配置
"/mimosa/system/ccp/warrantyLevel/saveList",//保存风险等级配置
"/mimosa/system/ccp/warrantyLevel/delete",//删除风险等级配置
"/mimosa/system/ccr/indicate/save",//新建/修改风险指标
"/mimosa/system/ccr/indicate/enable",//启用风险指标配置
"/mimosa/system/ccr/indicate/disable",//禁用风险指标配置
"/mimosa/system/ccr/indicate/delete",//删除风险指标配置
"/mimosa/system/ccr/indicate/collect/save",//风险预警等级模型风险指标采集
"/mimosa/system/ccr/warning/options/batchDelete",//删除评分模型
"/mimosa/system/ccr/warning/options/save",//新建/修改评分模型
"/mimosa/system/ccr/warning/collect/add",//风险采集
"/mimosa/system/ccr/warning/collect/handle/handle",//风险处置
"/mimosa/system/ccr/options/batchDelete",//删除评分模型
"/mimosa/system/ccr/options/save",//新建/修改评分模型
"/mimosa/duration/assetPool/createPool",//新建资产池
"/mimosa/duration/assetPool/auditPool",//审核资产池
"/mimosa/duration/assetPool/editPool",//修改资产池
"/mimosa/duration/assetPool/editPoolForCash",//编辑账户
"/mimosa/duration/assetPool/updateDeviationValue",//编辑偏离损益
"/mimosa/duration/assetPool/updateAssetPool",//删除资产池
"/mimosa/duration/assetPool/userPoolProfit",//计算每日收益
"/mimosa/duration/assetPool/fee/setting/save",//保存计提费率配置
"/mimosa/duration/order/purchaseForFund",//现金管理类工具申购
"/mimosa/duration/order/auditForPurchase",//现金管理类工具申购审核
"/mimosa/duration/order/appointmentForPurchase",//现金管理类工具申购预约
"/mimosa/duration/order/orderConfirmForPurchase",//现金管理类工具申购确认
"/mimosa/duration/order/redeem",//现金管理类工具赎回
"/mimosa/duration/order/auditForRedeem",//现金管理类工具赎回审核
"/mimosa/duration/order/appointmentForRedeem",//现金管理类工具赎回预约
"/mimosa/duration/order/orderConfirmForRedeem",//现金管理类工具赎回确认
"/mimosa/duration/order/purchaseForTrust",//信托计划申购
"/mimosa/duration/order/auditForTrust",//信托计划申购审核
"/mimosa/duration/order/appointmentForTrust",//信托计划申购预约
"/mimosa/duration/order/orderConfirmForTrust",//信托计划申购确认
"/mimosa/duration/order/purchaseForTrans",//信托计划转入申购
"/mimosa/duration/order/auditForTrans",//信托计划转入审核
"/mimosa/duration/order/appointmentForTrans",//信托计划转入预约
"/mimosa/duration/order/orderConfirmForTrans",//信托计划转入确认
"/mimosa/duration/order/applyForBack",//信托计划退款
"/mimosa/duration/order/auditForBack",//信托计划退款审核
"/mimosa/duration/order/orderConfirmForBack",//信托计划退款确认
"/mimosa/duration/order/applyForIncome",//信托计划本息兑付
"/mimosa/duration/order/auditForIncome",//信托计划本息兑付审核
"/mimosa/duration/order/orderConfirmForIncome",//信托计划本息兑付确认
"/mimosa/duration/order/applyForTransfer",//信托计划转让
"/mimosa/duration/order/auditForTransfer",//信托计划转让审核
"/mimosa/duration/order/orderConfirmForTransfer",//信托计划转让确认
"/mimosa/duration/order/applyForOverdueTransfer",//信托计划逾期转让
"/mimosa/duration/order/auditForOverdueTransfer",//信托计划逾期转让审核
"/mimosa/duration/order/orderConfirmForOverdueTransfer",//信托计划逾期转让确认
"/mimosa/duration/order/updateOrder",//逻辑删除订单
"/mimosa/duration/order/updateFund",//纠偏现金管理类工具持有额度
"/mimosa/duration/order/updateTrust",//纠偏信托计划持有额度
"/mimosa/duration/order/cancelOrder",//逻辑作废订单--坏账核销
"/mimosa/duration/market/saveMarketAdjust",//市值校准录入
"/mimosa/duration/market/auditMarketAdjust",//市值校准录入审核
"/mimosa/duration/market/deleteMarketAdjust",//市值校准录入删除
"/mimosa/duration/income/saveIncomeAdjust",//收益分配录入
"/mimosa/duration/income/auditPassIncomeAdjust",//收益分配录入审核通过
"/mimosa/duration/income/auditFailIncomeAdjust",//收益分配录入审核不通过
"/mimosa/duration/income/deleteIncomeAdjust",//收益分配录入删除
"/mimosa/duration/income/allocateIncomeAgain",//收益分配再次发送
"/mimosa/duration/feigin/create",//费金计提
"/mimosa/duration/feigin/updateByOid",//费金提取
"/mimosa/duration/feigin/deleteByOid",//逻辑删除
"/mimosa/duration/spv/create",//spv创建
"/mimosa/duration/spv/update",//更新spv
"/mimosa/duration/spv/edit",//更新spv
"/mimosa/boot/publisheroffset/clear",//清算
"/mimosa/boot/publisheroffset/volconfirm",//份额确认
"/mimosa/boot/publisheroffset/close",//结算
"/mimosa/boot/publisheroffset/offsetmoney",//录入产品手续费
"/mimosa/boot/tradeorder/refuse",//拒绝赎回单
"/mimosa/boot/tradeorder/abandon",//作废投资单
"/mimosa/boot/tradeorder/refundpart",//订单退款(部分)
"/mimosa/boot/tradeorder/refundall",//订单退款(全部)
"/mimosa/spv/order/delete",//spv作废订单
"/mimosa/spv/order/confirm",//审核确定spv订单
"/mimosa/spv/order/save",//新加spv订单
"/mimosa/product/reward/save",//保存产品奖励收益设置
"/mimosa/product/duration/operate/openPurchase",//产品打开申购开关申请
"/mimosa/product/duration/operate/closePurchase",//产品关闭申购开关申请
"/mimosa/product/duration/operate/openRedeem",//产品打开赎回开关申请
"/mimosa/product/duration/operate/closeRedeem",//产品关闭赎回开关申请
"/mimosa/product/duration/operate/passPurchaseRemeed",//审核通过-(申请打开申购,申请关闭申购,申请打开赎回,申请关闭赎回)
"/mimosa/product/duration/operate/failPurchaseRemeed",//审核驳回-(申请打开申购,申请关闭申购,申请打开赎回,申请关闭赎回)
"/mimosa/product/duration/operate/rollbackPurchaseRemeed",//撤销-(申请打开申购,申请关闭申购,申请打开赎回,申请关闭赎回)
"/mimosa/product/duration/operate/deletePurchaseRemeed",//删除-(申请打开申购,申请关闭申购,申请打开赎回,申请关闭赎回)
"/mimosa/product/duration/productClearing",//触发产品清盘
"/mimosa/product/duration/currentTradingRuleSet",//更新活期产品交易规则设置
"/mimosa/product/duration/updateSingleDailyMaxRedeem",//单人单日赎回限额设置
"/mimosa/product/duration/updateFastRedeem",//快速赎回设置
"/mimosa/product/duration/openRedeemConfirm",//激活赎回确认
"/mimosa/product/duration/closeRedeemConfirm",//屏蔽赎回确认
"/mimosa/product/duration/updateProductLabel",//标签设置确认
"/mimosa/product/duration/productRaiseFail",//募集失败
"/mimosa/product/duration/productRaiseSuccess",//募集成功
"/mimosa/product/cash",//还本付息
"/mimosa/product/duration/salePosition/save",//新加产品可售份额申请
"/mimosa/product/duration/salePosition/auditPass",//产品可售份额申请审核通过
"/mimosa/product/duration/salePosition/auditFail",//产品可售份额申请审核驳回
"/mimosa/product/duration/salePosition/rollback",//产品可售份额申请撤销
"/mimosa/product/duration/salePosition/delete",//产品可售份额申请删除
"/mimosa/product/channel/order/saveChannel",//新加产品渠道申请
"/mimosa/product/channel/order/rollbackChannel",//产品渠道申请撤销
"/mimosa/product/channel/order/auditFailChannel",//产品渠道申请审核驳回
"/mimosa/product/channel/order/auditPassChannel",//产品渠道申请审核通过
"/mimosa/product/channel/order/deleteChannel",//产品渠道申请删除

"/operate/admin/ctrl/role/save", //新建角色
"/operate/admin/ctrl/role/update", //修改角色
"/operate/admin/ctrl/role/delete", //删除角色
"/operate/admin/create/form", //添加用户
"/operate/admin/update", //修改用户
"/operate/admin/freeze", //冻结用户
"/operate/admin/unfreeze", //解冻用户

'/cms/boot/banner/add', // banner-新增
'/cms/boot/banner/update', // banner-修改
'/cms/boot/banner/delete', // banner-删除
'/cms/boot/banner/active', // banner-批量上下架
'/cms/boot/banner/dealapprove', // banner-审批
'/cms/boot/notice/add', // 公告-新增
'/cms/boot/notice/update', // 公告-修改
'/cms/boot/notice/delete', // 公告-删除
'/cms/boot/notice/onshelf', // 公告-上下架
'/cms/boot/notice/dealapprove', // 公告-审批
'/cms/boot/notice/setPage', // 公告-首页推荐
'/cms/boot/notice/setTop', // 公告-是否置顶
'/cms/boot/advice/tab/add',	// 反馈意见-新增
'/cms/boot/advice/tab/delete', // 反馈意见-删除
'/cms/boot/advice/addToTab', // 反馈意见-添加标签
'/cms/boot/advice/remark', // 反馈意见-意见处理
'/cms/boot/images/add',	// 图片管理-新增
'/cms/boot/images/delete', // 图片管理-删除
'/cms/boot/information/add', //资讯管理-新增资讯
'/cms/boot/information/delete', //资讯管理-删除资讯
'/cms/boot/information/edit', //资讯管理-资讯修改
'/cms/boot/information/review', //资讯管理-审核资讯
'/cms/boot/information/publish', //资讯管理-发布资讯
'/cms/boot/information/sortInfoTypeUp', //资讯管理-资讯类型排序--上移
'/cms/boot/information/sortInfoTypeDown', //资讯管理-资讯类型排序--下移
'/cms/boot/information/addInformationType', //资讯管理-新增资讯类型
'/cms/boot/information/delInformationType', //资讯管理-删除资讯类型
'/cms/boot/information/dealInfoTypeStatus',  //资讯管理-资讯类型--启用/关闭
'/cms/boot/information/isHome', //资讯管理-资讯类型--首页推荐
'/cms/boot/information/informationOff', //资讯管理-资讯下架
'/cms/boot/activity/addActivity', //活动管理-新增活动
'/cms/boot/activity/activityReview', //活动管理-活动审核
'/cms/boot/activity/activityPubilsh', //活动管理-活动上架/下架
'/cms/boot/activity/editActivity', //活动管理-活动编辑
'/cms/boot/activity/activityDel',  //活动管理-活动编删除
'/cms/boot/version/addVersion', //版本管理-新增版本
'/cms/boot/version/versionReview', //版本管理-版本审核
'/cms/boot/version/versionPubilsh', //版本管理-版本上架/下架
'/cms/boot/version/editVersion',  //版本管理-版本编辑
'/cms/boot/version/versionDelete',  //版本管理-版本删除
'/cms/boot/push/addPush',  //推送管理-新增推送
'/cms/boot/push/pushReview',  //推送管理-推送审核
'/cms/boot/push/pushPubilsh',  //推送管理-推送上架
'/cms/boot/push/editPush',  //推送管理-推送编辑
'/cms/boot/push/delPush' //推送管理-推送删除
]

function isForbidden (url) {
	if (localStorage.getItem('resources') && localStorage.getItem('resources') === 'HOMEPAGE') {
		var index = url.indexOf("/mimosa");
		if (index === -1) {
			index = url.indexOf("/operate")
		}
		if (index === -1) {
			index = url.indexOf("/cms")
		}
		url=url.substring(index);
		for (var i = 0; i < forbiddenUrls.length; i++) {
			if(url.startsWith(forbiddenUrls[i])){
				return true;
			}
		}
		return false;
	}else{
		return false;
	}
}

define({
  /**
   * get
   *
   * 参数url：请求服务器url
   * 参数data：ajax请求所需参数，javascript对象
   *          -- data.contentType：请求数据类型，默认为'application/json'，可设置为'form'兼容旧式form请求
   *          -- data.dataType：返回数据类型，默认为'json'
   *          -- data.data：请求数据体，json格式，默认为空
   * 参数success：请求成功后触发的回调函数
   * 参数failure：请求失败后触发的回调函数
   */
  get: function (url, data, success, failure) {
  	if (isForbidden(url)) {
		toastr.error('您正在使用的是试用账号，无法操作此功能，如需操作，请购买正式版。', '错误信息', {
		    timeOut: 3600000
		})
		return;
	  }
    mimosaBaseAjax('get', url, data, success, failure)
  },
  /**
   * post，参数同上
   */
  post: function (url, data, success, failure) {
  	if (isForbidden(url)) {
		toastr.error('您正在使用的是试用账号，无法操作此功能，如需操作，请购买正式版。', '错误信息', {
		  timeOut: 3600000
		})
		return;
  	}
    mimosaBaseAjax('post', url, data, success, failure)
  }
})

function mimosaBaseAjax (type, url, options, success, failure) {
  if (typeof options === 'function') {
    failure = success
    success = options
    options = undefined
  }
  
  options = options || {}

  $.ajax({
    type: type,
    url: url,
    contentType: (function () {
      switch (options.contentType) {
        case 'form':
          return 'application/x-www-form-urlencoded'
        default:
          return 'application/json'
      }
    })(),
    xhrFields: {
      withCredentials: true
    },
    dataType: options.dataType || 'json',
    data: options.data || '',
    async: options.async === undefined ? true : options.async
  }).then(function (res) {
    if (!res.errorCode) {
      if (success) {
        success(res)
      }
    } else {
      if (failure) {
        failure(res)
      } else {
      	errorHandle(res)
      }
    }
  }, function (err) {
    console.log(err)
  })
}

function errorHandle (err) {
  toastr.error(err.errorMessage, '错误信息', {
    timeOut: 3600000
  })
  if (err.errorMessage == '用户未登录') {
  	location.href = 'login.html';
  	return false;
  }
  switch (err.errorCode) {
    case 10002:
      alert(err.errorMessage)
      location.href = 'login.html'
      break
    default:
      break
  }
  console.log(err)
}
