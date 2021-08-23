exports.abc = function() {
	console.log("in data check")
	funOnAir();
};

function funOnAir() {
   var content='19-07-30,00:00:03,on-air,DA0250,101,"Rhiannon Fleetwood Mac,HHJJ ",03:33,00:00:10,00000|-|00000|00';
    var data = content.split(',');
    for (var i = 0; i < data.length; i++) {
        // Trim the excess whitespace.
        data[i] = data[i].replace(/^\s*/, "").replace(/\s*$/, "");
        // Add additional code here, such as:
        // console.log(data[i]);
    }
    //program_name,airtime,airdate,length,advert_url,song_url,program_type,program_id,next_time,advert_type
    //19-07-30,00:00:03,on-air,DA0250,101,"Rhiannon Fleetwood Mac,HHJJ ",03:33,00:00:10,00000|-|00000|00

	var dataValue = [];
	console.log(data[5]);
	var hasCommaName = alphanumeric(data[6]);
	console.log(hasCommaName);

    if (hasCommaName) {
        dataValue.push(data[5]+ ' ' +data[6]);
        dataValue.push(data[1]);
        dataValue.push('dateFormated');
        dataValue.push(data[7]);
        dataValue.push('');
        dataValue.push('');
        dataValue.push(data[4]);
        dataValue.push(data[3]);
        dataValue.push(data[8]);
        dataValue.push('1');
    }else{
        dataValue.push(data[5]);
        dataValue.push(data[1]);
        dataValue.push('dateFormated');
        dataValue.push(data[6]);
        dataValue.push('');
        dataValue.push('');
        dataValue.push(data[4]);
        dataValue.push(data[3]);
        dataValue.push(data[7]);
        dataValue.push('1');
	}
	console.log(dataValue);
    console.log("data saved");

}


function alphanumeric(inputtxt) {
    var alphanumber = /^[0-9a-zA-Z]+$/;
	var alphaonly = /^[A-Za-z]+$/;
	var haveOnlyOneAlpha=/^.*[a-zA-Z0-9][^a-zA-Z0-9]*$/ ;
    if (inputtxt.match(haveOnlyOneAlpha)) {
        return true;
    } else {
        return false;
    }
}