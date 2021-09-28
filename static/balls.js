$(document).ready(function(){
    const h = 400
    const height = h - 30
    const w = 1000
    var nBalls = 100
    var ballsUsed = 0
    var data = Array(9).fill(0);
    let darray = Array(9)
    let divisions = Array(nBalls - 1).fill(0);
    let yScale, xScale, svg, dnum, dnum2

    let dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();

    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();

    let minDate = year + '-' + month + '-' + day;
    $('#hi').attr('min', minDate)
    $('#lo').attr('min', minDate)

    function dateFormat(dt1, dt2){
        let d1 = new Date(dt1)
        let d2 = new Date(dt2 - 24 * 60 * 60 * 1000)
        let ds1 = d1.toLocaleString('default', {month: 'short', timeZone: 'UTC'}) + ' ' + d1.getUTCDate()
        let ds2 = d2.toLocaleString('default', {month: 'short', timeZone: 'UTC'}) + ' ' + d2.getUTCDate()
        return ds1 + ' - ' + ds2
    }

    // Hidden form registers for the balls
    for(let i = 1; i <= 9; i++){
        $('#main_form').append(`<input type="hidden" name="b${i}" id="b${i}-form">`)
    }

    $('#hi, #lo').change(function (){
        let hi = $('#hi').val()
        let lo = $('#lo').val()
        data.fill(0)
        ballsUsed = 0
        if (hi !== "" && lo !== ""){
            let fdate = Date.parse(lo)
            let ldate = Date.parse(hi)
            for(let i = 0; i < 9; i++){
                dnum = fdate + ((ldate - fdate) * i) / 9
                dnum2 = fdate + ((ldate - fdate) * (i+1)) / 9
                darray[i] = dateFormat(dnum, dnum2)
            }
            $('#balls-used').text('You have used 0 guesses.')
            $('#balls-left').text('You have ' + nBalls + ' guesses remaining.')

            $('svg').remove()

            svg = d3.select('#target-div')
                .append('svg')
                .attr('width', w)
                .attr('height', h)

            xScale = d3.scaleBand()
                .domain(darray)
                .rangeRound([0, w])
                .paddingInner(0.08);

            yScale = d3.scaleLinear()
                .domain([0, d3.max(data)])
                .range([0, h - 30])

            svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('x', function(d, i){
                    return xScale(darray[i])
                })
                .attr('y', function(d){
                    return height - yScale(d) ;
                })
                .attr('width', xScale.bandwidth())
                .attr('height', function(d){
                    return yScale(d);
                })
                .attr('fill', function(d){
                    return 'rgb(0, 0, 0)';
                //    placeholder color
                });

            // svg.selectAll('line')
            //     .data(divisions)
            //     .enter()
            //     .append('line')
            //     .style('stroke', 'white')
            //     .style('stroke-width', 2)
            //     .attr('x1', 0)
            //     .attr('x2', w)
            //     .attr('y1', h)
            //     .attr('y2', h)
            //
			svg.selectAll("text")
			   .data(data)
			   .enter()
			   .append("text")
			   .text(function(d) {
			   		return d;
			   })
			   .attr("text-anchor", "middle")
			   .attr("x", function(d, i) {
			   		return xScale(darray[i]) + xScale.bandwidth()/2;
			   })
				.attr("y", function(d) {
                    if(yScale(d)<=45) {
                        return height - yScale(d) - 1;
                    }else{
                        return height - yScale(d) + 14;
                    }
                })
			   .attr("font-family", "sans-serif")
			   .attr("font-size", "11px")
			   .attr("fill", function (d) {
				   if(yScale(d)<=45){
				       return "black"
				   }else{
				       return "white";
				   }
               });

            svg.append('g')
                .attr('transform', 'translate(' + 0 + ',' + 370 + ')')
                .call(d3.axisBottom(xScale))

            if((ldate - fdate) <= 0) {
                $('#contain-div').slideUp()
                alert('The latest date must be after the earliest date.')
            } else if(new Set(darray).size < 9){
                $('#contain-div').slideUp()
                alert('There must be at least 9 days between your earliest and latest dates.')
            } else {
                $('#contain-div').slideDown()
            }
        }
        })
    $(':button').click(function (){
        let buttonId = $(this).attr('id')
        let kind = buttonId.charAt(0)
        let i = parseInt(buttonId.charAt(1))
        // Probably better to do a check and reject then to check and reset afterwards
        // Better to beg for forgiveness than ask for permission I always say
        if (kind === 'p'){
            data[i - 1] ++
            ballsUsed ++
            if (ballsUsed > nBalls){
                data[i - 1] --
                ballsUsed --
            }
        } else if (kind === 'm'){
            data[i - 1] --
            ballsUsed --
            if (data[i-1] < 0){
                data[i - 1] ++
                ballsUsed ++
            }
        }
        if (ballsUsed === 1) {
            $('#balls-used').text('You have used ' + ballsUsed + ' guess.')
        } else {
            $('#balls-used').text('You have used ' + ballsUsed + ' guesses.')
        }

        if (nBalls - ballsUsed === 1) {
            $('#balls-left').text('You have ' + (nBalls - ballsUsed) + ' guess remaining.')
        } else {
            $('#balls-left').text('You have ' + (nBalls - ballsUsed) + ' guesses remaining.')
        }
        for(let i = 1; i <= 9; i++){
            $(`#b${i}-form`).val(data[i - 1])
        }

        divisions.fill(0)
        for(let i = 0; i < d3.max(data); i++){
            divisions[d3.max(data) - i] = i
        }

        yScale.domain([0, d3.max(data)])
        svg.selectAll('rect')
            .data(data)
            .transition()
            .duration(500)
            .ease(d3.easeExpOut)
            .attr('y', function(d){
                return height - yScale(d);
            })
            .attr('height', function(d){
                return yScale(d);
            })
            .attr('fill', function(d){
                return 'rgb(0,0,0)';
            })

        // svg.selectAll('line')
        //     .data(divisions)
        //     .transition()
        //     .ease(d3.easeExpOut)
        //     .duration(500)
        //     .attr('x1', 0)
        //     .attr('x2', w)
        //     .attr('y1', function (d){
        //         return height - yScale(d)
        //     })
        //     .attr('y2', function (d){
        //         return height - yScale(d)
        //     })

        svg.selectAll('text')
            .data(data)
            .transition()
            .ease(d3.easeExpOut)
            .duration(500)
            .text(function(d){
                return d;
            })
            .attr("x", function(d, i) {
                return xScale(darray[i]) + xScale.bandwidth()/2;
            })
            .attr("y", function(d) {
                if(yScale(d)<=15) {
                    return height - yScale(d) - 2;
                }else{
                    return height - yScale(d) + 14;
                }
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", function (d) {
                if(yScale(d)<=15){
                    return "black"
                }else{
                    return "white";
                }
            });
    })



})