let margin = {top: 50, bottom: 50, left: (window.innerWidth-1000)/2, right: 50}, height = 600, width = 1000
let countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
let educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

let countyData
let educationData

let k = [1, 2]

let the_map = d3.select('#map')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', 'translate('+margin.left+','+margin.top+')')
            .append('g')

let the_pie = d3.select('#pie')
    .attr('width', width)
    .attr('height', height+400)
    .attr('transform', 'translate('+margin.left+', 20)')
    .append('g')

let linked_chart = d3.select('#linkedChart')
    .attr('style', 'opacity:0')


let tooltip = d3.select('#tooltip')
let tooltip2 = d3.select('#tooltip2').attr('style', 'opacity:0')
console.log(d3)
console.log(topojson)

let oldIndex = 0
let colors = d3.interpolateReds






function drawMap() {
    the_map.selectAll('path')
        .data(countyData)
        .enter()
        .append('path')
        .attr('d', d3.geoPath())
        .attr('class', 'county')
        .attr('stateName', (countyDataItem)=>{
            let id = countyDataItem['id']
            let state = educationData.find((county) => {
                if (county['fips'] === id){
                    return county['state']
                    // console.log(county['state'])
                }
            })
            // console.log(state['state'])
            return state['state']
        })
        .attr('fill', (countyDataItem)=>{
            let id = countyDataItem['id']
            let county = educationData.find((county) => {
                return county['fips'] === id
            })
            let percentage = county['bachelorsOrHigher']
            if (percentage <= 15){
                return 'tomato'
            }
            else if (percentage <= 30){
                return 'orange'
            }
            else if (percentage <= 45){
                return 'lightgreen'
            }else return 'limegreen'
        })
        .attr('data-fips', (countyDataItem)=>{
            return countyDataItem['id']
        })
        .attr('data-education', (countyDataItem)=>{
            let id = countyDataItem['id']
            let county = educationData.find((county) => {
                return county['fips'] === id
            })
            let percentage = county['bachelorsOrHigher']
            return percentage
        })
        .on('mouseover', (e, countyDataItem)=>{
            let id = countyDataItem['id']
            let county = educationData.find((county) => {
                return county['fips'] === id
            })
            let stateName = county['state']
            d3.selectAll(".pieState").each(function(d,i) {
                if (d3.select(this).attr('pieStateName')===String(stateName)){
                    d3.select(this).attr('fill', 'cyan')
                }
            })


            let posArr = getPos(e)
            // console.log(posArr)
            tooltip.transition()
                .style('visibility', 'visible')

            let index = parseInt(id/1000)
            // console.log('index is ' +index)
            let linkedItem = []
            if (index !== oldIndex) {
                linkedItem = educationData.filter(function (eduData) {
                    return parseInt(eduData['fips'] / 1000) === index
                }).map(function (eduData){
                    return eduData['bachelorsOrHigher']
                })
                // console.log(linkedItem)
                linkedItem.sort((a, b) => b - a)
                if (linkedItem.length > 11) {
                    linkedItem = linkedItem.slice(0,10)
                }

                // console.log(linkedItem)
                let pieData = d3.pie().sort(null).value(function(d) {return d})(linkedItem)
                let segments1 = d3.arc().innerRadius(0).outerRadius(100).padAngle(0.05).padRadius(50)
                linked_chart.append('g')
                    .attr('transform', 'translate(100, 100)')
                    .selectAll('path')
                    .data(pieData)
                    .enter()
                    .append('path')
                    .attr('d', segments1)
                    .attr('fill', function (d, i){
                        let start = linkedItem[0]
                        let end = linkedItem[9]
                        let interval = (end-start)/10
                        return colors(1-(linkedItem[i]-start)*0.1/interval)
                    })
                // let pieDataFilteredArr = []
                // for (var i = 0; i < linkedItem.length; i++) {
                //     let val = linkedItem[i]
                //     for (var j = 0; j < pieData.length; j++){
                //         if (parseInt(pieData[j].value) === val){
                //             pieDataFilteredArr.push(pieData[j])
                //         }
                //     }
                // }
                // for (var i = 0; i < pieDataFilteredArr.length; i++) {
                //     console.log('arr: ' + pieDataFilteredArr[i])
                // }
                linked_chart
                    .selectAll('mySlices')
                    .data(pieData)
                    .enter()
                    .append('text')
                    .text(function(d, i){
                        return pieData[i].value +'%'}
                    )
                    .attr("transform", function(d) {
                        let x = 0.8*segments1.centroid(d)[0]+100
                        let y = 0.8*segments1.centroid(d)[1]+100
                        return "translate(" +x+','+y  + ")";
                    })
                    .style("text-anchor", "middle")
                    .style("font-size", 10)

            }
            tooltip.text(county['fips']+'-'+county['area_name']+', '+county['state']+
            ': '+county['bachelorsOrHigher']+'%')


            xPos = posArr[0]+50
            yPos = posArr[1]+50
            linked_chart.attr('width', 200)
                .attr('height', 200)
                .attr('style', 'opacity:1')
                .style('background-color', '#efefef')
                .attr('transform', 'translate('+xPos+','+yPos+')')



            oldIndex = index



        })
        .on('mouseout', (e, countyDataItem)=>{
            tooltip.transition()
                .style('visibility', 'hidden')
            linked_chart.attr('style', 'opacity:0')
        })
}



let stateEduAverage = []
let oldStateIndex = 1
let eduTotalNum = 0
let count = 0
let keys = []
let values = []

function drawPie(){
    for (var i = 0; i < stateEduAverage.length; i++) {
        const key = Object.keys(stateEduAverage[i])
        keys.push(key)
    }
    let pieData = d3.pie()
        .sort(null)
        .value(function(d) {
            for(var key in d) {
                var value = d[key];
                values.push(value)
                // console.log(key+" = "+value);
            }
        return value
    })(stateEduAverage)
    console.log(pieData)
    let segments = d3.arc().innerRadius(0).outerRadius(450).padAngle(0.05).padRadius(50)
    the_pie.append('g')
        .attr('transform', 'translate(500, 500)')
        .selectAll('path')
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', segments)
        .attr('class', 'pieState')
        .attr('pieStateName', function (d, i){
            return keys[i]
        })
        .attr('fill', function (d, i){

            let start = Math.min.apply(null, values)
            let end = Math.max.apply(null, values)
            let interval = (end-start)/51

            return colors((values[i]-start)*0.02/interval)
        })
        .on('mouseover', (e, countyDataItem)=>{
            console.log('index: '+countyDataItem.index)
            let pie_state_name = keys[countyDataItem.index]
            let pie_state_name_str = String(pie_state_name)
            // console.log('pie state name: '+pie_state_name_str)
            d3.selectAll(".county").each(function(d,i) {
                if (d3.select(this).attr('stateName')===pie_state_name_str){
                    d3.select(this).attr('fill', 'cyan')
                }
            })
            tooltip2.text('The average county education rate of bachelors or higher for state '+keys[countyDataItem.index]
                +' is '+values[countyDataItem.index]+'%')
            tooltip2.attr('style', 'opacity:1')
        })
        .on('mouseout', (e, countyDataItem)=>{
            tooltip2.attr('style', 'opacity:0')
        })

    the_pie
        .selectAll('mySlices')
        .data(pieData)
        .enter()
        .append('text')
        .text(function(d, i){
            // console.log('d: '+);
            // console.log(segments.centroid(d))
            return pieData[i].value +'%'}
            )
        .attr("transform", function(d) {
            let x = 1.6*segments.centroid(d)[0]+500
            let y = 1.6*segments.centroid(d)[1]+500
            return "translate(" +x+','+y  + ")";
        })
        .style("text-anchor", "middle")
        .style("font-size", 12)



}


d3.json(countyURL).then(
    (data, error) => {
        if(error){
            console.log(error)
        }else{
            countyData = topojson.feature(data, data.objects.counties).features
            // countyData = data
            console.log('County Data')
            console.log(countyData)

            d3.json(educationURL).then(
                (data, error) => {
                    if(error){
                        console.log(error)
                    }
                    else{
                        educationData = data
                        console.log('Education Data')
                        console.log(educationData)
                        console.log(educationData.length)

                        for (var i = 0; i < educationData.length; i++){
                            // console.log(parseInt(educationData[i]['fips']/1000))
                            count += 1
                            if (parseInt(educationData[i]['fips']/1000)===oldStateIndex){
                                eduTotalNum += educationData[i]['bachelorsOrHigher']
                                // console.log(eduTotalNum)
                            }
                            if ((i < educationData.length-1 && parseInt(educationData[i+1]['fips']/1000)!==oldStateIndex)
                            || i === educationData.length-1){
                                // console.log('stats set to 0')
                                let stateEduItem = {}
                                let stateName = educationData[i]['state']
                                let stateStats = eduTotalNum/count
                                stateEduItem[stateName] = stateStats
                                stateEduAverage.push(stateEduItem)
                                eduTotalNum = 0
                                count = 0

                                if (i < educationData.length-1) {
                                    oldStateIndex = parseInt(educationData[i+1]['fips'] / 1000)
                                }
                            }
                        }

                        drawMap()
                        drawPie()
                        // console.log(stateEduAverage)

                    }
                }
            )
        }
    }
)

function getPos(e){
    x=e.clientX;
    y=e.clientY;
    let posArr = []
    posArr.push(x)
    posArr.push(y)
    return posArr
}
