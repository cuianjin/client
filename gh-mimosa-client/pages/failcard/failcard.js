// 载入所需模块
define([
        'http',
        'config',
        'util',
        'extension'
    ],
    function(http, config, util, $$) {
        return {
            name: 'failcard',
            siteInfo: {
                siteOid: ''
            },
            init: function() {
                var _this = this;
                _this.pagesInit();
                _this.bindEvent();
            },
            approveInfo: {
                apprOid: '',
                apprResult: ''
            },
            pagesInit: function() {
                var _this = this;
                var noCardOptions = {
                    number: 1,
                    size: 10,
                    offset: 0,
                    name: '',
                    phone: '',
                    isFeedback: '',
                    isBind: 'no',
                    bindTimeBegin:'',
                    bindTimeEnd:''
                }
                var bindCardOptions = {
                    number: 1,
                    size: 10,
                    offset: 0,
                    name: '',
                    phone: '',
                    isFeedback: '',
                    isBind: 'is',
                    bindSuccessTimeBegin:'',
                    bindSuccessTimeEnd:''
                }
                var confirm = $('#confirmModal');
                
                var noCardConfig = {
                    ajax: function(origin) {
                        http.post(util.buildQueryUrl(config.api.ope.failCard.list, {
                            page: noCardOptions.number,
                            rows: noCardOptions.size,
                            name: noCardOptions.name,
                            phone: noCardOptions.phone,
                            isFeedback: noCardOptions.isFeedback,
                            isBind: noCardOptions.isBind,
                            bindTimeBegin: noCardOptions.bindTimeBegin,
                            bindTimeEnd: noCardOptions.bindTimeEnd
                        }), function(rlt) {
                            origin.success(rlt)
                        })
                    },
                    idField: 'oid',
                    pagination: true,
                    sidePagination: 'server',
                    pageList: [10, 20, 30, 50, 100],
                    queryParams: getNoCardQueryParams,
                    onClickCell: function (field, value, row, $element) {
                      	switch (field) {
                    		case 'phone':toDetailBefore(value,row)
                      	}
                    },
                    columns: [{
                        width: 60,
                        align: 'center',
                        formatter: function(val, row, index) {
                            return noCardOptions.offset + index + 1
                        }
                    }, {
                        field: 'phone',
                        class: 'table_title_detail'
                    }, {
                        field: 'source',
                    }, {
                        field: 'systemReason',
                    }, {
                        field: 'bindTime',
                        formatter: function(val, row, index) {
                            return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
                        }
                    }, {
                        field: 'lastFeedback',
                    }, {
                        align: 'center',
                        formatter: function(val, row, index) {
                            var buttons = [{
                                text: '反馈',
                                type: 'button',
                                class: 'item_feedback'
                            }]
                            return util.table.formatter.generateButton(buttons, 'noCardTable');
                        },
                        events: {
                            'click .item_feedback': toFeedBack
                        }
                    }]
                }
                
                var bindCardConfig = {
                    ajax: function(origin) {
                        http.post(util.buildQueryUrl(config.api.ope.failCard.list, {
                            page: bindCardOptions.number,
                            rows: bindCardOptions.size,
                            name: bindCardOptions.name,
                            phone: bindCardOptions.phone,
                            isFeedback: bindCardOptions.isFeedback,
                            isBind: bindCardOptions.isBind,
                            bindSuccessTimeBegin: bindCardOptions.bindSuccessTimeBegin,
                            bindSuccessTimeEnd: bindCardOptions.bindSuccessTimeEnd
                        }), function(rlt) {
                            origin.success(rlt)
                        })
                    },
                    idField: 'oid',
                    pagination: true,
                    sidePagination: 'server',
                    pageList: [10, 20, 30, 50, 100],
                    queryParams: getBindCardQueryParams,
                    onClickCell: function (field, value, row, $element) {
                      	switch (field) {
                    		case 'name':toDetailAfter(value,row)
                      	}
                    },
                    columns: [{
                        width: 60,
                        align: 'center',
                        formatter: function(val, row, index) {
                            return bindCardOptions.offset + index + 1
                        }
                    }, {
                        field: 'name',
                        class: 'table_title_detail'
                    }, {
                        field: 'phone',
                    }, {
                        field: 'source',
                    }, {
                        field: 'systemReason',
                    }, {
                        field: 'bindTime',
                        align: 'right',
                        formatter: function(val, row, index) {
                            return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
                        }
                    }, {
                        field: 'lastFeedback',
                    }, {
                        field: 'bindSuccessTime',
                        formatter: function(val, row, index) {
                            return util.table.formatter.timestampToDate(val, 'YYYY-MM-DD HH:mm:ss')
                        }
                    }]
                }
                
                var tim = util.table.formatter.timestampToDate(new Date(), 'YYYY-MM-DD')+ ' 00:00:00';
                $(document.noCardSearchForm.bindTimeBegin).val(tim);
                $(document.bindCardSearchForm.bindSuccessTimeBegin).val(tim);
                $$.searchInit($('#noCardSearchForm'), $('#noCardTable'));
                $$.searchInit($('#bindCardSearchForm'), $('#bindCardTable'));
                $('#noCardTable').bootstrapTable(noCardConfig);
                $('#bindCardTable').bootstrapTable(bindCardConfig);
      
                
                //审核前查看
                function toDetailBefore(value, row) {
                    $$.detailAutoFix($('#detailForm'), row); // 自动填充详情	   
                    $('#flag').hide();
                    $('#PageDetailModal').modal('show');
                }
                //审核后查看
                function toDetailAfter(value, row) {
                    $$.detailAutoFix($('#detailForm'), row); // 自动填充详情	   
                    $('#flag').show();
                    $('#PageDetailModal').modal('show');
                }
                //审核
                function toFeedBack(e, value, row) {
                    _this.approveInfo.apprOid = row.oid;
                    $('#approveForm').clearForm().find('input[type=hidden]').val('')
                    // 重置和初始化表单验证
                    $("#approveForm").validator('destroy')
                    util.form.validator.init($("#approveForm"));
                    
                    $$.formAutoFix($('#approveForm'), row); 
                    
                    $('#approvetModal').modal('show');
                }
                //未绑卡查询
                function getNoCardQueryParams(val) {
                    var form = document.noCardSearchForm
                        // 分页数据赋值
                    noCardOptions.size = val.limit
                    noCardOptions.number = parseInt(val.offset / val.limit) + 1
                    noCardOptions.offset = val.offset
                    noCardOptions.name = form.name.value.trim()
                    noCardOptions.phone = form.phone.value.trim()
                    noCardOptions.bindTimeBegin = form.bindTimeBegin.value.trim()
                    noCardOptions.bindTimeEnd = form.bindTimeEnd.value.trim()
//					noCardOptions.bindTimeEnd = getNextDate(noCardOptions.bindTimeEnd)	// 结束时间加一天
                    return val
                }
                
                //已审核查询
                function getBindCardQueryParams(val) {
                    var form = document.bindCardSearchForm
                        // 分页数据赋值
                    bindCardOptions.size = val.limit
                    bindCardOptions.number = parseInt(val.offset / val.limit) + 1
                    bindCardOptions.offset = val.offset
                    bindCardOptions.name = form.name.value.trim()
                    bindCardOptions.phone = form.phone.value.trim()
                    bindCardOptions.bindSuccessTimeBegin = form.bindSuccessTimeBegin.value.trim()
                    bindCardOptions.bindSuccessTimeEnd = form.bindSuccessTimeEnd.value.trim()
//					noCardOptions.updateTimeEnd = getNextDate(noCardOptions.updateTimeEnd);
                    return val
                }
                
                function getNextDate(val){
                    if (val && val!=''){
                        var now = new Date(val);
                        var next = now.getTime()+24*60*60*1000;
                        var nextDate = util.table.formatter.timestampToDate(next, 'YYYY-MM-DD');
                        return nextDate;
                    }else{
                        return val;
                    }
                }
            },
            bindEvent: function() {
                var _this = this;
                
                //审批操作按钮
                $("#approveBut").on('click', function() {
                    if (!$('#approveForm').validator('doSubmitCheck')) return
                    document.approveForm.aoid.value = _this.approveInfo.apprOid;
                    $('#approveForm').ajaxSubmit({
                        url: config.api.ope.failCard.feedback,
                        success: function(res) {
                            if (res.errorCode == 0) {
                                $('#approvetModal').modal('hide')
                                $('#noCardTable').bootstrapTable('refresh')
                                $('#bindCardTable').bootstrapTable('refresh')
                            } else {
                                errorHandle(res);
                            }
                        }
                    })
                })
            }
        }
    })