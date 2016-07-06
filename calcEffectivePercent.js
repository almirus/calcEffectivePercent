calcEffectivePercent : function(resultData){
	// ������� ������ (��)
	var getBP = function (arr) {
		var res = false,
			resCount = 0;
		var summArr = 0;
		for (var i = 0; i < arr.length; i++) {
			var checkItem = arr[i];
			var checkItemCount = 0;
			for (var j = 0; j < arr.length; j++) {
				if (arr[j] == checkItem) {
					checkItemCount++;
				}
			}
			if (checkItemCount > resCount) {
				res = checkItem;
				resCount = checkItemCount;
			}
			summArr = summArr + arr[i];
		}
		if (resCount == 1) {
			res = Math.round(summArr / arr.length);
		}
		return res;
	};
	// ������� � ����
	var getDaysDiff = function(dates){
		var datesDiff = [];
		for (var i = 1; i < dates.length; i++) {
			datesDiff.push((dates[i] - dates[i - 1]) / (24 * 60 * 60 * 1000));
		}
		return datesDiff;
	};
	var f_dfdx=function(x, sum_arr, e_arr, q_arr)
	{
		var FXi		= 0;
		var dFdXi	= 0;

		var sumFx	= sum_arr[0];
		var sumFxDx = -sum_arr[0];

		for(i = 1; i < sum_arr.length; i++)
		{
			// �������� ������� ��� ����� 2014�
			FXi		= sum_arr[i]/((1+e_arr[i]*x)*Math.pow(1+x, q_arr[i]));
			dFdXi	= -sum_arr[i]*q_arr[i]/((1+e_arr[i]*x)*Math.pow(1+x,q_arr[i]+1));
			sumFx 	= sumFx + FXi;
			sumFxDx = sumFxDx + dFdXi;
		}
		return sumFx/sumFxDx;
	};
	// ���� ������� ������� �������
	var searchRootNewton = function(x1, e, sum_arr, e_arr, q_err)
	{
		var x, a, j;
		j = 0;
		x = x1;
		do{
			a = f_dfdx(x, sum_arr, e_arr, q_err);
			x = x - a;
			j++;
		}while(Math.abs(a) > e && j < 100);
		return x;
	};
	var sum_arr = [];
	var date_arr = [];
	var i;
	// ������������ ������ � "�������" �������
	// resultData �������� ���� �������� (� ��������� ����) � ����� ��������
	for (i = 0; i < resultData.paymentShedule['dates'].length; i++) {
		sum_arr.push(+resultData.paymentShedule['epPSK'][i]);
		var date = resultData.paymentShedule['dates'][i].split('.');
		date_arr.push(new Date(date[2],date[1]-1,date[0]));
	}

	var m = date_arr.length; // ����� ��������
	var datesDiff = getDaysDiff(date_arr); // ������ ������ � ����
	//������� ������� ������ bp
	var bp=getBP(datesDiff);
	//������� ����� ������� �������� � ����:
	var cbp = 365 / bp;
	//��������� �� � Q� ��� ������� �������
	var e = [];
	var q = [];
	var k;
	// ���������� ������� �������� � ������� �[�] � Q[�]
	for (k = 1; k < m; k++) {
		e[k] = (((date_arr[k] - date_arr[0])/ (24 * 60 * 60 * 1000)) % bp) / bp;
		q[k] = Math.floor(((date_arr[k] - date_arr[0])/ (24 * 60 * 60 * 1000)) / bp);
	}
	e[0] = 0;
	q[0] = 0;

	i = Math.abs(searchRootNewton(0,0.00001,sum_arr,e,q));
	//������� ��� � ��������� 3 ����� ����� �������
	return Math.floor(i * cbp * 100 * 1000) / 1000;
}