// 载入所需模块
define([
  'http',
  'config',
  'util',
  'extension'
],
function (http, config, util, $$) {
	return {
	  name: 'advice',
	  init: function (){
	  	var _this = this;
	  	_this.pagesInit();
	  	_this.bindEvent();
	  },
	  adviceOid:{
	  	oid: ''
	  },
	  pagesInit: function () {
	  	var _this = this;
		  // 分页配置
		  var pageOptions = {
		    number: 1,
		    size: 10,
		    offset: 0,
		    tabOid:'',
		    userID: '',
		    content:'',
		    dealStatus:'',
		    reqTimeBegin:'',
		    reqTimeEnd:''
		  }
		  var tabsPageOptions = {
		    number: 1,
		    size: 10,
		    offset: 0,
		    delStatus: 'no'
		  }
		  // 数据表格配置
		  var tableConfig = {
				ajax: function (origin) {
          http.post(config.api.adviceList, {
            data: {
              page: pageOptions.number,
              rows: pageOptions.size,
              tabOid: pageOptions.tabOid,			      
			        content: pageOptions.content,
			        userID: pageOptions.userID,
			        dealStatus: pageOptions.dealStatus,
			        reqTimeBegin: pageOptions.reqTimeBegin,
			        reqTimeEnd: pageOptions.reqTimeEnd
            },
            contentType: 'form'
          }, function (rlt) {
            origin.success(rlt)
          })
        },
        idField:'oid',
		    pagination: true,
		    sidePagination: 'server',
		    pageList: [10, 20, 30, 50, 100],
		    queryParams: getQueryParams,
		     onClickCell: function (field, value, row, $element) {
				  switch (field) {
		        case 'userID':
		        	queryInfo(value,row)
		        	break
				  }
				},
		    columns: [
		      {
		        width: 30,
		        align: 'center',
		        formatter: function (val, row, index) {
		          return pageOptions.offset + index + 1
		        }
		      },
		      {
            field: 'userID',
            class: 'align-right table_title_detail'
          },
          {
            field: 'userName'
          },
          {
            field: 'phoneType'
          },
          {
            field: 'content',
            class: 'm_hide',
            formatter: function(val, row, index){
            	return decodeURIComponent(val)
            }
          },
          {
            field: 'createTime',
            class: 'align-right',
            formatter: function (val, row, index) {
              return	util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
            }
          },
          {
            field: 'tabOid',
            formatter: function (val, row, index) {
              return	util.enum.transform('tabTypes', val);
            }
          },
          {
            field: 'operator',
            formatter: function (val, row, index) {
              return val ? val : '-';
            }
          },
          {
            field: 'dealStatus',
            formatter: function (val, row, index) {
              return	util.enum.transform('dealTypes', val);
            }
          },
		      {      
		      	align: 'center',
		        formatter: function (val, row, index) {	
		        	var buttons = [{
									text: '操作',
									type: 'buttonGroup',
//									isCloseBottom: index >= $('#adviceTable').bootstrapTable('getData').length - 1,
									sub:[{
												text: '加标签',
												type: 'button',
												class: 'add',
												isRender: true
											},
											{
												text: '意见处理',
												type: 'button',
												class: 'remark',
												isRender: true
											}]
								}]	
		        	return util.table.formatter.generateButton(buttons, 'adviceTable');
		        },
		        events:{		
		        	'click .detail':function(e, value, row){		    
		        		 	
		        	},
		        	'click .add':function(e, value, row){		    
		        		  _this.adviceOid.oid = row.oid;
		        		  var createForm = document.createForm
									$(createForm).validator('destroy')
									util.form.validator.init($(createForm));
		        		  $('#createForm').clearForm();
									$('#tabsModal').modal('show');
		        	},
		        	'click .remark':function(e, value, row){		
	        				var remarkForm = document.remarkForm
									$(remarkForm).validator('destroy')
									util.form.validator.init($(remarkForm));
		        		  $('#remarkForm').clearForm();
	              	remarkForm.remark.value = row.remark;
	                remarkForm.oid.value = row.oid;
	                $('#remarkModal').modal('show');
		        	}
		        }
		       
		      }
		    ]
		  }
		  function queryInfo(value,row){
		  	$$.detailAutoFix($('#detailForm'), row); // 自动填充详情            	
	            		$('#createTime').html(null == row.createTime ? '--' : util.table.formatter.timestampToDate(row.createTime, 'YYYY-MM-DD HH:mm:ss'))
	       					$('#dealTime').html(null == row.dealTime ? '--' : util.table.formatter.timestampToDate(row.dealTime, 'YYYY-MM-DD HH:mm:ss'))
	       					$('#detailTab').html(util.enum.transform('tabTypes', row.tabOid))
									$('#content').val(decodeURIComponent(row.content));
									$('#detailRemark').val(row.remark);
	                $('#detailModal').modal('show')
		  }
		  var tabsTableConfig = {
				ajax: function (origin) {
          http.post(config.api.tabList, {
            data: {
              page: tabsPageOptions.number,
              rows: tabsPageOptions.size,
              delStatus: tabsPageOptions.delStatus
            },
            contentType: 'form'
          }, function (rlt) {
            origin.success(rlt)
          })
        },
        idField:'oid',
		    pagination: true,
		    sidePagination: 'server',
		    pageList: [10, 20, 30, 50, 100],
		    queryParams: getTabsQueryParams,
		    columns: [
		      {
		        width: 30,
		        align: 'center',
		        formatter: function (val, row, index) {
		          return tabsPageOptions.offset + index + 1
		        }
		      },
		      {
            field: 'name'
          },
		      {            
		      	align: 'center',
		        formatter: function (val, row, index) {
		        	return '<button type="button" class="btn btn-default del" data-dismiss="modal">删除</button>' + 
		        	       '&nbsp;&nbsp;<button type="button" class="btn btn-default check" data-dismiss="modal">选 择</button>';;
		        },
		        events:{
		        	'click .del': function(e, value, row){
		            http.post(config.api.tabDelete,{
						        data:{
						        		oid:row.oid
						        },
						        contentType: 'form'
						      }, function(res){		
						      	if(res.errorCode==0){
						      	  //反馈意见标签下拉列表
						          http.post(config.api.tabsSelect, {
						               contentType: 'form'
						          }, function (enums) {
						              for (var key in enums) {
						                 config[key] = enums[key]
						              }
						              $$.enumSourceInit($(document))
						          })
						      	}
						      	$('#tabsTable').bootstrapTable('refresh');
						      	$('#adviceTable').bootstrapTable('refresh');	
						    })
		        	},
		        	'click .check': function(e, value, row){
		        		http.post(config.api.adviceToTab,{
						        data:{
						        		oid: _this.adviceOid.oid,
						        		tabOid: row.oid						        	
						        },
						        contentType: 'form'
						      }, function(res){						        	 
					           $('#adviceTable').bootstrapTable('refresh')
						    })
		        		$('#tabsModal').modal('hide')
		        	}
		        }
		      }
		    ]   
		  }
			
		  // 初始化数据表格
		  $('#adviceTable').bootstrapTable(tableConfig);
		  $('#tabsTable').bootstrapTable(tabsTableConfig);
		  $$.searchInit($('#searchForm'), $('#adviceTable'));
		 
			util.form.validator.init($('#createForm'))
			util.form.validator.init($('#remarkForm'))
			
			function getQueryParams(val){
				 var form = document.searchForm
        // 分页数据赋值
        pageOptions.size = val.limit
        pageOptions.number = parseInt(val.offset / val.limit) + 1
        pageOptions.offset = val.offset
        pageOptions.tabOid = form.tabOid.value.trim()
        pageOptions.userID = form.userID.value.trim()
			  pageOptions.content = form.content.value.trim()
			  pageOptions.dealStatus = form.dealStatus.value.trim()
			  pageOptions.reqTimeBegin = form.reqTimeBegin.value	
			  pageOptions.reqTimeEnd = form.reqTimeEnd.value
        return val
			}
			
			function getTabsQueryParams(val){				
        // 分页数据赋值
        tabsPageOptions.size = val.limit
        tabsPageOptions.number = parseInt(val.offset / val.limit) + 1
        tabsPageOptions.offset = val.offset
        return val
			}
			
		},
		bindEvent:function(){
			var _this = this;

			$('#createSubmit').on('click', function(){
				if (!$('#createForm').validator('doSubmitCheck')) return
				
				$('#createForm').ajaxSubmit({
          url: config.api.tabAdd,
          success: function (res) {
          	if(res.errorCode==0){          		
            	 $('#tabsTable').bootstrapTable('refresh')
            	  //反馈意见标签下拉列表
			          http.post(config.api.tabsSelect, {
			               contentType: 'form'
			          }, function (enums) {
			              for (var key in enums) {
			                 config[key] = enums[key]
			              }
			              $$.enumSourceInit($(document))
			          })
          	}else{
          		errorHandle(res);
          	}
          }
        })
			})
			
			//备注
			$('#remarkBut').on('click', function(){
				if (!$('#remarkForm').validator('doSubmitCheck')) return
				$('#remarkForm').ajaxSubmit({
          url: config.api.adviceToRemark,
          success: function (res) {
          	if(res.errorCode==0){          		
          		 $('#adviceTable').bootstrapTable('refresh');
            	 $('#remarkModal').modal('hide');
          	}else{
          		errorHandle(res);
          	}
          }
        })
			})
			
			 
		} 
 }
})
