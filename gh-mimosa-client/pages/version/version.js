define([
  'http',
  'config',
  'util',
  'extension'
],
function (http, config, util, $$) {
  return {
    name: 'version',
    init: function (){
	  	var _this = this;	  	
	  	_this.pagesInit();
	  	_this.bindEvent();
	  },
	  versionInfo:{
	  	oid:''
	  },
	  pagesInit: function () {
	  	var _this = this;
		  // 分页配置
		  var pageOptions = {
        number: 1,
        size: 10,
        offset: 0,
        versionNo:'',
        status:'',
        publishTimeBegin:'',
        publishTimeEnd:'',
        system:''
      }
		  
		  var confirm = $('#confirmModal');
		  // 数据表格配置
		  var tableConfig = {
				ajax: function (origin) {
          http.post(config.api.versionQuery, {
            data: {
              page: pageOptions.number,
              rows: pageOptions.size,
              versionNo:pageOptions.versionNo,
              status:pageOptions.status,
              publishTimeBegin:pageOptions.publishTimeBegin,
              publishTimeEnd:pageOptions.publishTimeEnd,
              system:pageOptions.system
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
		        case 'versionNo':
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
            field: 'versionNo',
            class: 'table_title_detail align-right'
          },
          {
            field: 'system',
            formatter: function (val) {
            	return util.enum.transform('versionSystemType', val);
            }
          },
          {
            field: 'publishTime',
            align: 'right',
            formatter: function (val, row, index) {
              return	(undefined == val ||val==null)?'-':util.table.formatter.timestampToDate(val, 'YYYY-MM-DD')
            }
          },
          {
            field: 'description',
          },
          {
            field: 'status',
            formatter: function (val) {
            	return util.enum.transform('versionStatus', val);
            }
          },
          {
          	align: 'center',
            formatter: function (val, row, index) {
            	var buttons = [{
            		text: '发布',
            		type: 'button',
            		class: 'item-on',
            		isRender: row.status=='reviewed'
            	}]
            	var format = util.table.formatter.generateButton(buttons, 'bannerTable')
            	if(row.status=='reviewed'){
            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;" class="fa fa-pencil-square-o item-update"></span>'
            		
            	}
            	if(true){
            		format += '<span style=" margin:auto 0px auto 10px;cursor: pointer;width:35px;" class="fa fa-trash-o item-del"></span>';
            	}
            	return format;
            },
            events: {
              'click .item-detail': function (e, value, row) {
                     
								
              },
              'click .item-update': function (e, value, row) {
              	 _this.versionInfo.oid = row.oid;            
              
								http.post(config.api.versionInfo, {
                  data: {
                    oid: row.oid
                  },
                  contentType: 'form'
                }, function (result) {
                	  if(row.system=='increment'){
                	  	//去除重复提交样式
											$('#refreshDivWgt').removeClass('overlay');
											$('#refreshIWgt').removeClass('fa fa-refresh fa-spin');
                      $$.formAutoFix($('#createForm1'), result); // 自动填充详情    
                      $('#expectPublishTime').val(result.expectPublishTime==null?'--':util.table.formatter.timestampToDate(result.expectPublishTime, 'YYYY-MM-DD'));
                      $('#createForm1').validator('validate')
                      $('#createModal').modal('show').find('.modal-title').html("修改版本"); 
                	  }else if(row.system=='ios'){
                	  	//去除重复提交样式
											$('#refreshDivios').removeClass('overlay');
											$('#refreshIios').removeClass('fa fa-refresh fa-spin');
                	  	$$.formAutoFix($('#createbyVersionIOSFrom'), result); // 自动填充详情      
                      $('#expectPublishTimeIOS').val(result.expectPublishTime==null?'--':util.table.formatter.timestampToDate(result.expectPublishTime, 'YYYY-MM-DD'));
                      $('#createbyVersionIOSFrom').validator('validate');
                      $('#createModalbyVersionIOS').modal('show').find('.modal-title').html("修改版本"); 
                	  }else if(row.system=='android'){
                	  	//去除重复提交样式
											$('#refreshDivandroid').removeClass('overlay');
											$('#refreshIandroid').removeClass('fa fa-refresh fa-spin');
                	  	$$.formAutoFix($('#createbyVersionAndroidForm'), result); // 自动填充详情      
                      $('#expectPublishTimeAndroid').val(result.expectPublishTime==null?'--':util.table.formatter.timestampToDate(result.expectPublishTime, 'YYYY-MM-DD'));
                      $('#createbyVersionAndroidForm').validator('validate');;
                      $('#createModalbyVersionAndroid').modal('show').find('.modal-title').html("修改版本"); 
                	  }
                })
								
              },
              'click .item-del': function (e, value, row) {
               $$.confirm({
                  container: $('#deleteConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.versionDelete, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#versionTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
              'click .item-on': function (e, value, row) {
               $$.confirm({
                  container: $('#publishConfirm'),
                  trigger: this,
                  accept: function () {
                    http.post(config.api.versionPubilsh, {
                      data: {
                        oid: row.oid
                      },
                      contentType: 'form',
                    }, function (result) {
                      $('#versionTable').bootstrapTable('refresh')
                    })
                  }
                })
              },
            }
          }
        ]
      }
			function queryInfo(value,row){
				http.post(config.api.versionInfo, {
                  data: {
                    oid: row.oid
                  },
                  contentType: 'form'
                }, function (result) {
                  $$.detailAutoFix($('#createFormDetail'), result); // 自动填充详情   
                  //更新频率
                  if(result.checkInterval==0){
                  	$('#checkInterval').html('0(注：0天为每次启动都提示)')
                  }else{
                  	$('#checkInterval').html(result.checkInterval+'天')
                  }
                  $("#expectPublishTimeDetail").text(result.expectPublishTime==null?'--':util.table.formatter.timestampToDate(result.expectPublishTime, 'YYYY-MM-DD '));
                  $("#descriptionDetail").text(result.description);
                  $("#createTimeDetail").text(result.createTime==null?'--':util.table.formatter.timestampToDate(result.createTime, 'YYYY-MM-DD '));
             
                  $("#publishTimeDetail").text(result.publishTime==null?'--':util.table.formatter.timestampToDate(result.publishTime, 'YYYY-MM-DD '));

                  if(result.system == 'ios'){
                  	$("#iosUrlDetail").show();
                  }else{
                  	$("#iosUrlDetail").hide();
                  }
                  if(result.system == 'increment'){
                  	$("#appVersionShow").hide();
                  }else{
                  	$("#appVersionShow").show();
                  }
                })
								$('#detailModal').modal('show')
			}
      $('#versionTable').bootstrapTable(tableConfig)
      $$.searchInit($('#searchForm'), $('#versionTable'))
      
      
      util.form.validator.init($('#createForm1'))
			util.form.validator.init($('#createbyVersionIOSFrom'))
      util.form.validator.init($('#createbyVersionAndroidForm'))
      
      util.form.validator.init($('#wgtForm'))
			util.form.validator.init($('#apkForm'))
			
//=====================================新增增量升级 start====================================
      /**
       * 新建增量升级---页面显示
       */
      $("#createVersion").on("click",function(){
  		  var form = document.createForm
				$(form).validator('destroy')
				util.form.validator.init($(form));
      	
      	var wgtForm = document.wgtForm
				$(wgtForm).validator('destroy')
				util.form.validator.init($(wgtForm));
      	
      	 _this.versionInfo.oid = '';
      	 	//去除重复提交样式
				$('#refreshDivWgt').removeClass('overlay');
				$('#refreshIWgt').removeClass('fa fa-refresh fa-spin');
				 $('#wgtForm').clearForm()
        $('#createForm1')
        .clearForm()
        .find('input[type=hidden]').val('')
        $('#createModal').modal('show').find('.modal-title').html("新建增量升级");
			   //获取现有版本号
			  http.post(config.api.getVersionNoByIncrement, {
            data: {},
             contentType: 'post',
          }, function (result) {
              $('#incrementVerionNo').html(result.errorMessage);
          }
        )
			})
            
       //新建增量版本升级--数据提交
      $('#createSubmit').on('click', function () {
      	if (!$('#createForm1').validator('doSubmitCheck')) return 
      	
      	document.createForm.upgradeType.value='increment'
      	var value=document.createForm.versionNo.value
      	var reg=/^(\d+)\.(\d+)\.(\d+)$/;
      	var incrementCheck = new RegExp(reg);
      	if(!incrementCheck.test(value)){
      		toastr.error('增量版本号格式不正确！', '错误信息', {
				    timeOut: 3000
				  })
      	  return;
      	}
      	
      	var isHasSame=0;
      	http.post(config.api.isHasSameVersion, {
            data: {
            	system:"increment",
            	versionNo:value,
            	oid:_this.versionInfo.oid
            },
            async:false,
             contentType: 'form',
          }, function (result) {
              isHasSame=result;
          }
        )
      	if(isHasSame>0){
      		if(!_this.versionInfo.oid){
      				toastr.error('已有相同版本号！', '错误信息', {
						    timeOut: 3000
						  })
	      		  return;
      		}
      	}
				document.createForm.upgradeType.value="increment";
				document.createForm.system.value="increment";
      	if (document.wgtForm.picFile.value) {
      		var filename2=document.wgtForm.picFile.value;
      	  var postf2=util.getSuffixName(filename2);
      		if(postf2.toLowerCase()!=".wgt"){
      				toastr.error('增量包格式不正确！', '错误信息', {
						    timeOut: 3000
						  })
      		    return;
      		}
      		var postf=util.getfileName(filename2);
					document.createForm.fileName.value=postf;
      		$('#refreshDivWgt').addClass('overlay');
				  $('#refreshIWgt').addClass('fa fa-refresh fa-spin');
          $('#wgtForm').ajaxSubmit({
            url: config.api.yup,
            success: function (picResult) {
              document.createForm.fileUrl.value = '/' + picResult[0].url
              wgtSubmit()
            }
          })
        }else{
        	if(!_this.versionInfo.oid){
	        		toastr.error('增量包版本不能为空！', '错误信息', {
						    timeOut: 3000
						  })
	        		return
        	}else{
        		 wgtSubmit()
        	}
        }
      })

			//增量升级
      function wgtSubmit () {
        var url = '';
        if(_this.versionInfo.oid){
					url = config.api.versionEdit;
					document.createForm.oid.value = _this.versionInfo.oid
				}else{
					url = config.api.versionAdd;					
				}
				$('#refreshDivWgt').addClass('overlay');
			  $('#refreshIWgt').addClass('fa fa-refresh fa-spin');
        $('#createForm1').ajaxSubmit({
          url: url,
          async:false,
          success: function (res) {
          	if(res.errorCode==0){
          		 _this.versionInfo.oid = "";
          		 $('#createModal').modal('hide')
          	   $('#versionTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(res)
          		//去除重复提交样式
							$('#refreshDivWgt').removeClass('overlay');
							$('#refreshIWgt').removeClass('fa fa-refresh fa-spin');
          	}
          }
        })
      }
//==============================新增增量 end==========================================      
      
//==============================新增ISO start========================================
      /**
       * 新建版本升级--IOS--页面显示
       */
      $("#createVersionTypeIOS").on("click",function(){
      	var createFormbyVersionIOS = document.createFormbyVersionIOS
				$(createFormbyVersionIOS).validator('destroy')
				util.form.validator.init($(createFormbyVersionIOS));
      	      
      	 _this.versionInfo.oid = '';
      	//去除重复提交样式
				$('#refreshDivios').removeClass('overlay');
				$('#refreshIios').removeClass('fa fa-refresh fa-spin');
        $('#createbyVersionIOSFrom')
        .clearForm()
        .find('input[type=hidden]').val('')
        $('#createModalbyVersionIOS').modal('show').find('.modal-title').html("新建IOS版本");
        document.createFormbyVersionIOS.compulsory.value="1"
        $("#iosCheckInterval").val("0");
			  //获取现有版本号
			  http.post(config.api.getVersionNoByVersion, {
            data: {
            	system:"ios"
            },
             contentType: 'form',
          }, function (result) {
              $('#verionNoIOS').html(result.ios);
          }
        )
			})
      
      /**
       * 新建版本升级--IOS--数据提交
       */
      $("#createSubmitByIOS").on("click",function(){
      	if (!$('#createbyVersionIOSFrom').validator('doSubmitCheck')) return 
      	
      	var valueIOS=document.createFormbyVersionIOS.versionNo.value
      	var reg=/^(\d+)\.(\d+)\.(\d+)$/;
      	var iosCheck=  new RegExp(reg);
      	if(!iosCheck.test(valueIOS)){
      		toastr.error('升级版本IOS的版本号格式不正确！', '错误信息', {
				    timeOut: 3000
				  })
      	  return false;
      	}
      	//相同版本判断
      	var isHasSame=0;
      	http.post(config.api.isHasSameVersion, {
            data: {
            	system:"ios",
            	versionNo:valueIOS,
            	oid:_this.versionInfo.oid
            },
            async:false,
             contentType: 'form',
          }, function (result) {
              isHasSame=result;
          }
        )
      	var iosDownload = document.createFormbyVersionIOS.fileUrl.value;
			  if(iosDownload){
				    var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
						var objExp=new RegExp(Expression);
						if(!objExp.test(iosDownload)){
						    toastr.error('请输入合法的链接地址(如：http(s)://www.baidu.com)', '错误信息', {
							    timeOut: 3000
							  })
						    return false;
						}
			  }
      	if(isHasSame>0){
      		if(!_this.versionInfo.oid){
      			toastr.error('已有相同版本号', '错误信息', {
					    timeOut: 3000
					  })
	      		return;
      		}
      	}
			  byVersionSubmitIOS()
			})
      
      //新建版本ios提交数据
      function byVersionSubmitIOS(){
      	$('#refreshDivios').addClass('overlay');
				$('#refreshIios').addClass('fa fa-refresh fa-spin');
      	document.createFormbyVersionIOS.system.value="ios";
      	document.createFormbyVersionIOS.upgradeType.value="version";
     
      	var url = '';
				if(_this.versionInfo.oid){
					url = config.api.versionEdit;
				}else{
					url = config.api.versionAdd;					
				}
      	$('#createbyVersionIOSFrom').ajaxSubmit({
          url: url,
          success: function (addResult) {
          	if(addResult.errorCode==0){
          	  _this.versionInfo.oid = "";
          		$('#createModalbyVersionIOS').modal('hide')
              $('#versionTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(addResult)
          		//去除重复提交样式
							$('#refreshDivios').removeClass('overlay');
							$('#refreshIios').removeClass('fa fa-refresh fa-spin');
          	}
          }
        })
      }
//=================================新增IOS end=============================================== 

//=================================新增Android start=========================================
      /**
       * 新建版本升级--Android--页面显示
       */
      $("#createVersionTypeAndroid").on("click",function(){
      	var createFormbyVersionAndroid = document.createFormbyVersionAndroid
				$(createFormbyVersionAndroid).validator('destroy')
				util.form.validator.init($(createFormbyVersionAndroid));
				
				var apkForm = document.apkForm
				$(apkForm).validator('destroy')
				util.form.validator.init($(apkForm));
      	
      	 _this.versionInfo.oid = '';
      	//去除重复提交样式
				$('#refreshDivandroid').removeClass('overlay');
				$('#refreshIandroid').removeClass('fa fa-refresh fa-spin');
				 $('#apkForm').clearForm()
        $('#createbyVersionAndroidForm')
        .clearForm()
        .find('input[type=hidden]').val('')
        $('#createModalbyVersionAndroid').modal('show').find('.modal-title').html("新建Android版本");
				document.createFormbyVersionAndroid.compulsory.value="1"
				$("#androidCheckInterval").val("0");
			  //获取现有版本号
			  http.post(config.api.getVersionNoByVersion, {
            data: {
            	system:"android"
            },
             contentType: 'form',
          }, function (result) {
              $('#verionNoAndroid').html(result.ios);
          }
        )
			})

      /**
       * 新建版本升级--Android--数据提交
       */
      $("#createSubmitByAndroid").on("click",function(){
      	if (!$('#createbyVersionAndroidForm').validator('doSubmitCheck')) return 
      	
      	var valueAndroid = document.createFormbyVersionAndroid.versionNo.value
      	var reg=/^(\d+)\.(\d+)\.(\d+)$/;
      	var androidCheck = new RegExp(reg);
      	if(!androidCheck.test(valueAndroid)){
      		toastr.error('升级版本Android的版本号格式不正确！', '错误信息', {
				    timeOut: 3000
				  })
      	  return false;
      	}
      	
      	var isHasSame=0;
      	http.post(config.api.isHasSameVersion, {
            data: {
            	system:"android",
            	versionNo:valueAndroid,
            	oid:_this.versionInfo.oid
            },
            async:false,
             contentType: 'form',
          }, function (result) {
              isHasSame=result;
          }
        )
      	if(isHasSame>0){
      		if(!_this.versionInfo.oid){
  				  toastr.error('已有相同版本号！', '错误信息', {
					    timeOut: 3000
					  })
	      		return;
      		}
      	}
      	document.createFormbyVersionAndroid.system.value="android";
      	document.createFormbyVersionAndroid.upgradeType.value="version";
				if (document.apkForm.picFile.value) {
					var filename2=document.apkForm.picFile.value;
      	  var postf2=util.getSuffixName(filename2);
      		if(postf2.toLowerCase()!=".apk"){
      			toastr.error('版本包格式不正确！', '错误信息', {
					    timeOut: 3000
					  })
      		  return false;
      		}
      		
					var postf=util.getfileName(filename2);
					document.createFormbyVersionAndroid.fileName.value=postf;
      			$('#refreshDivandroid').addClass('overlay');
					$('#refreshIandroid').addClass('fa fa-refresh fa-spin');
          $('#apkForm').ajaxSubmit({
            url: config.api.yup,
            success: function (picResult) {
              document.createFormbyVersionAndroid.fileUrl.value = '/' + picResult[0].url
              byVersionSubmitAndroid();
            }
          })
        }else{
        	if(!_this.versionInfo.oid){
        			toastr.error('版本包不能为空！', '错误信息', {
						    timeOut: 3000
						  })
        			return false;
        	}else{
        		byVersionSubmitAndroid();
        	}
        }
			})
      
      //新建版本安卓提交数据
      function byVersionSubmitAndroid(){
      	var url = '';
      	
				if(_this.versionInfo.oid){
					url = config.api.versionEdit;
				}else{
					url = config.api.versionAdd;					
				}
				$('#refreshDivandroid').addClass('overlay');
			  $('#refreshIandroid').addClass('fa fa-refresh fa-spin');
      	$('#createbyVersionAndroidForm').ajaxSubmit({
          url: url,
          async:false,
          success: function (res) {
          	if(res.errorCode==0){
          		_this.versionInfo.oid="";
          		$('#createModalbyVersionAndroid').modal('hide')
              $('#versionTable').bootstrapTable('refresh')
          	}else{
          		errorHandle(res)
          		//去除重复提交样式
							$('#refreshDivandroid').removeClass('overlay');
							$('#refreshIandroid').removeClass('fa fa-refresh fa-spin');
          	}
            
          }
        })
      }
//=============================新增Android end=============================

      function getQueryParams (val) {
      	 // 分页数据赋值
        pageOptions.size = val.limit
        pageOptions.number = parseInt(val.offset / val.limit) + 1
        pageOptions.offset = val.offset
        var form = document.searchForm
        pageOptions.versionNo = form.versionNo.value.trim()
        pageOptions.status = form.status.value
        pageOptions.publishTimeBegin=form.publishTimeBegin.value
        pageOptions.publishTimeEnd=form.publishTimeEnd.value
        pageOptions.system=form.system.value
        return val
      }
    },   
	  bindEvent:function(){
			var _this = this;
		} 
  }
})
