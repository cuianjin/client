/**
 * 查询凭证
 */
define([
	'http',
	'config',
	'util',
	'extension'
], function(http, config, util, $$) {
	return {
		name: 'document',
		init: function() {

			http.post(config.api.duration.assetPool.getNameList, function(json) {
				var select = $(document.searchForm.relative);
				json.rows.forEach(function(item) {
					$('<option value="' + item.oid + '">' + item.name + '</option>').appendTo(select);
				});
			});

			var queryParams = {
				relative: '',
				startDate: '',
				endDate: '',
				page: 1,
				size: 10
			};

			$('#dataTable').bootstrapTable({
				classes: '',
				ajax: function(origin) {
					http.post(config.api.acct.book.document.entry.search, {
						data: queryParams,
						contentType: 'form'
					}, function(rlt) {
						origin.success(rlt)
					})
				},
				queryParams: function(val) {
					var form = document.searchForm;
					queryParams.relative = form.relative.value.trim();
					queryParams.startDate = form.startDate.value.trim();
					queryParams.endDate = form.endDate.value.trim();
					queryParams.size = val.limit;
					queryParams.page = parseInt(val.offset / val.limit) + 1;
				},
				pageNumber: queryParams.page,
				pageSize: queryParams.size,
				pagination: true,
				sidePagination: 'server',
				pageList: [10, 20, 30, 50, 100],
				columns: [{
					field: 'documentAcctDate',
					align: 'right',
					formatter: function(val, row, index) {
						return row.master ? val : '';
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#f9f9f9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'documentDocword',
					formatter: function(val, row, index) {
						return row.master ? val + '&nbsp;-&nbsp;' + row.documentAcctSn : '';
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#f9f9f9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'documentEntryDigest',
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#f9f9f9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'documentEntryAccountCode',
					formatter: function(val, row, index) {
						return val + '&nbsp;&nbsp;' + row.documentEntryAccountName;
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#f9f9f9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'documentEntryDrAmount',
					class: 'currency',		
					align: 'right',
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#f9f9f9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'documentEntryCrAmount',
					class: 'currency',
					align: 'right',
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#f9f9f9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'documentCreateTime',
					align: 'right',
					formatter: function(val, row, index) {
						return row.master ? val : '';
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#f9f9f9' : '#FFFFFF'
							}
						}
					}
				}, {
					field: 'documentOid',
					align: 'center',
					formatter: function(val, row, index) {

						var updateButton = {
							text: '明细',
							type: 'button',
							class: 'item-detail',
							isRender: true
						};

						var buttons = [updateButton];
						return row.master ? util.table.formatter.generateButton(buttons, 'dataTable') : '';
					},
					events: {
						'click .item-detail': function(e, value, row) {
							http.post(config.api.acct.book.document.entry.detail, {
								data: {
									documentOid: value
								},
								contentType: 'form'
							}, function(r) {
								console.log(r);
								$('#detailModal').find('.doc-title').html(r.docTitle);
								$('#detailModal').find('.doc-number').html('凭证字&nbsp;' + r.docWord + r.acctSn + '号');
								$('#detailModal').find('.doc-date').html('日期&nbsp;' + r.acctDate);
								$('#detailModal').find('.doc-term').html(r.docPeriod);
								$('#detailModal').find('.doc-attach').html('附单据&nbsp;' + r.invoiceNum + '&nbsp;张');
								$('#detailModal').find('.doc-updatetime').html('录入时间:&nbsp;' + r.createTime);
								$('#detailModal').find('.doc-detail').empty();

								$.each(r.details, function(i, e) {
									var tr = $('<tr></tr>');
									$('<td class="lsize lcontent">' + e.digest + '</td>').appendTo(tr);
									$('<td class="lsize lcontent">' + e.accountCode + '&nbsp;' + e.accountName + '</td>').appendTo(tr);

									var drTd = $('<td></td>');
									drTd.appendTo(tr);
									var dr = $('<ul class="number-body"></ul>');
									dr.appendTo(drTd);
									for (var x = 0; x < 11; x++) {
										$('<li>' + (e.dr[x] == ' ' ? '&nbsp;' : e.dr[x]) + '</li>').appendTo(dr);
									}

									var crTd = $('<td></td>');
									crTd.appendTo(tr);
									var cr = $('<ul class="number-body"></ul>');
									cr.appendTo(crTd);
									for (var x = 0; x < 11; x++) {
										$('<li>' + (e.cr[x] == ' ' ? '&nbsp;' : e.cr[x]) + '</li>').appendTo(cr);
									}

									$('#detailModal').find('.doc-detail').append(tr);
								});

								var sum = $('<tr></tr>');
								$('<td class="lsize" colspan="2" style="text-align: left; padding-left: 15px;">合计：' + r.amountCN + '</td>').appendTo(sum);

								var sdrTd = $('<td></td>');
								sdrTd.appendTo(sum);
								var sdr = $('<ul class="number-body"></ul>');
								sdr.appendTo(sdrTd);
								for (var x = 0; x < 11; x++) {
									$('<li>' + (r.dr[x] == ' ' ? '&nbsp;' : r.dr[x]) + '</li>').appendTo(sdr);
								}

								var scrTd = $('<td></td>');
								scrTd.appendTo(sum);
								var scr = $('<ul class="number-body"></ul>');
								scr.appendTo(scrTd);
								for (var x = 0; x < 11; x++) {
									$('<li>' + (r.cr[x] == ' ' ? '&nbsp;' : r.cr[x]) + '</li>').appendTo(scr);
								}

								$('#detailModal').find('.doc-detail').append(sum);

								$('#detailModal').modal('show');
							});
						}
					},
					cellStyle: function(val, row, index) {
						return {
							css: {
								'background-color': row.index % 2 == 0 ? '#f9f9f9' : '#FFFFFF'
							}
						}
					}

				}],
				onLoadSuccess: function(data) {
					$.each(data.rows, function(i, item) {
						if (item.master) {
							$('#dataTable').bootstrapTable('mergeCells', {
								index: i,
								field: 'documentAcctDate',
								colspan: 1,
								rowspan: item.rowspan
							});
							$('#dataTable').bootstrapTable('mergeCells', {
								index: i,
								field: 'documentDocword',
								colspan: 1,
								rowspan: item.rowspan
							});
							$('#dataTable').bootstrapTable('mergeCells', {
								index: i,
								field: 'documentCreateTime',
								colspan: 1,
								rowspan: item.rowspan
							});
							$('#dataTable').bootstrapTable('mergeCells', {
								index: i,
								field: 'documentOid',
								colspan: 1,
								rowspan: item.rowspan
							});
						}
					});
				}
			});

			$$.searchInit($('#searchForm'), $('#dataTable'));

		}
	}
})