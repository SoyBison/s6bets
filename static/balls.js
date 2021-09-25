$(document).ready(function(){
    const h = 400
    const w = 1000
    var nBalls = 100
    var ballsUsed = 0
    var data = Array(9).fill(0);
    let darray = Array(9)
    let yScale, xScale, svg, dnum
    $('#hi, #lo').change(function (){
        let hi = $('#hi').val()
        let lo = $('#lo').val()
        data.fill(0)
        ballsUsed = 0
        if (hi !== null && lo !== null){
            let fdate = Date.parse(lo)
            let ldate = Date.parse(hi)
            for(let i = 0; i < 9; i++){
                dnum = fdate + ((ldate - fdate) * i) / 9
                darray[i] = (new Date(dnum)).toDateString()
            }
            $('#balls-used').text('You have used 0 balls.')
            $('#balls-left').text('You have ' + nBalls + ' balls remaining.')

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
                .range([0, h - 35]);

            svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('x', function(d, i){
                    return xScale(darray[i])
                })
                .attr('y', function(d){
                    return h - yScale(d);
                })
                .attr('width', xScale.bandwidth())
                .attr('height', function(d){
                    return yScale(d);
                })
                .attr('fill', function(d){
                    return 'rgb(0, 0, 0)';
                //    placeholder color
                });

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
                    if(yScale(d)<=15) {
                        return h - yScale(d) - 2;
                    }else{
                        return h - yScale(d) + 14;
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

            svg.append('g')
                .attr('transform', 'translate(' + 0 + ',' + 30 + ')')
                .call(d3.axisTop(xScale))

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
            $('#balls-used').text('You have used ' + ballsUsed + ' ball.')
        } else {
            $('#balls-used').text('You have used ' + ballsUsed + ' balls.')
        }

        if (nBalls - ballsUsed === 1) {
            $('#balls-left').text('You have ' + (nBalls - ballsUsed) + ' ball remaining.')
        } else {
            $('#balls-left').text('You have ' + (nBalls - ballsUsed) + ' balls remaining.')
        }
        yScale.domain([0, d3.max(data)])
        svg.selectAll('rect')
            .data(data)
            .transition()
            .duration(500)
            .ease(d3.easeBounceOut)
            .attr('y', function(d){
                return h - yScale(d);
            })
            .attr('height', function(d){
                return yScale(d);
            })
            .attr('fill', function(d){
                return 'rgb(0,0,0)';
            })

        svg.selectAll('text')
            .data(data)
            .transition()
            .ease(d3.easeBounceOut)
            .duration(500)
            .text(function(d){
                return d;
            })
            .attr("x", function(d, i) {
                return xScale(darray[i]) + xScale.bandwidth()/2;
            })
            .attr("y", function(d) {
                if(yScale(d)<=15) {
                    return h - yScale(d) - 2;
                }else{
                    return h - yScale(d) + 14;
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