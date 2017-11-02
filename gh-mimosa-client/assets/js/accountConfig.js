
/**
 * 配置项，提供全局使用各项配置 amd模块，使用requirejs载入
 */
define(['config'], function(config) {
  this.host = '';
  return {
    host: this.host,
    /**
	 * api 接口提供与服务器异步交互地址
	 * 
	 */
    api: {
    	financeUser: {//用户
        	save: this.host + '/account/user/save',
        	update: this.host + '/account/user/update',
        	detail: this.host + '/account/user/detail',
        	list: this.host + '/account/user/list',
        	getUsers: this.host + '/account/user/getUsers'
        },
    	financeAccount: {//账号
        	add: this.host + '/account/account/submit',
        	save: this.host + '/account/account/save',
        	invalid: this.host + '/account/account/delete',
        	seal: this.host + '/account/account/seal',//封存账户
        	frozen: this.host + '/account/account/frozen',//冻结账户
        	thaw: this.host + '/account/account/thaw',//解冻账户
        	update: this.host + '/account/account/update',
        	edit: this.host + '/account/account/edit',
        	detail: this.host + '/account/account/detail',
        	list: this.host + '/account/account/list',
        	thawFrozenList: this.host + '/account/account/thawFrozen/list',//查询账户冻结解冻列表
        	auditList: this.host + '/account/account/audit/list',
        	updateList: this.host + '/account/account/update/list',//查询修改审核列表
        	addReject: this.host + "/account/account/add/reject", //新增账户审核不通过
			addApprove: this.host + "/account/account/add/approve", //新增账户审核通过
			sealReject: this.host + "/account/account/seal/reject", //封存账户审核不通过
			sealApprove: this.host + "/account/account/seal/approve", //封存账户审核通过
			updateReject: this.host + "/account/account/update/reject", //修改账户审核不通过
			updateApprove: this.host + "/account/account/update/approve", //修改账户审核通过
			thawReject: this.host + "/account/account/thaw/reject", //解冻账户审核不通过
			thawApprove: this.host + "/account/account/thaw/approve", //解冻账户审核通过
			frozenReject: this.host + "/account/account/frozen/reject", //冻结账户审核不通过
			frozenApprove: this.host + "/account/account/frozen/approve", //冻结账户审核通过
        	getRelationProducts: this.host + '/account/account/getRelationProducts'
        },
     accountTrans:{
        	    account_trans_select_list:'/account/trans/detaillist'
        },
     accountOrder:{
     	  account_order_select_list:'/account/order/list'
     },
     accountSign:{
    	  account_sign_select_list:'/account/card/cardlist'
    }
    }

  }
})