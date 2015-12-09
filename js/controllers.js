(function () {
'use strict';

	angular.module('geneGraphApp.controllers')
		.controller('graphCtrl', ['$scope', 'geneService', 'colorService', function($scope,
		geneService, colorService) {
			$scope.graphSettings = {};
			$scope.graphSettings.title = "Genome Neighborhood Graphic";
			$scope.graphSettings.graphwidth = document.getElementById('graphcontainer').offsetWidth - 20;
			$scope.graphSettings.graphwidthoriginal = document.getElementById('graphcontainer').offsetWidth - 20;
			$scope.graphSettings.graphwidthpercent = 100;
			$scope.graphSettings.maxwidth = 0;
			$scope.graphSettings.featureheight = 50;
			$scope.graphSettings.fontFamily = 'Arial, Helvetica, sans-serif';
			$scope.graphSettings.fontStyle = 'normal';
      $scope.graphSettings.fontSize = 18;
      $scope.graphSettings.labelPosition = 'middle';
			$scope.graphSettings.multilane = true;
			$scope.graphSettings.shiftgenes = false;
			$scope.graphSettings.keepgaps = false;
			$scope.graphSettings.currLane = 0;
      
			$scope.geneData = geneService.geneData;
      
			$scope.$on('updateGeneData', function(){
				$scope.geneData = geneService.geneData;
				$scope.graphSettings.maxwidth = geneService.getMaxWidth($scope.geneData);
				$scope.geneData = geneService.hideSmallGeneLabels($scope.geneData,$scope.graphSettings.maxwidth, $scope.graphSettings.graphwidth);
			});
			
			
			$scope.selectGene = function(index){
				$scope.$emit('geneClicked');
				$scope.selectedGenome = -1;
				$scope.selectedGene = parseInt(index);
        $scope.$apply();
			};
			$scope.selectGenome = function(genomeindex, wordindex){
				$scope.$emit('geneClicked');
				$scope.selectedGene = -1;
				$scope.selectedGenome = parseInt(genomeindex);
				$scope.selectedWord = parseInt(wordindex);
        $scope.$apply();
			};
			$scope.changeGraphWidthPercent = function(newWidth){
				$scope.graphSettings.graphwidth = Math.round((parseInt(newWidth) / 100) * $scope.graphSettings.graphwidthoriginal);
			};
			$scope.changeGraphWidth = function(newWidth){
				$scope.graphSettings.graphwidth = parseInt(newWidth);
			};
			$scope.changeFeatureHeight = function(newHeight){
				$scope.graphSettings.featureheight = parseInt(newHeight);
			};
			$scope.changeLabelColor = function(selectedGene){
				$scope.geneData[selectedGene].labelcolorchanged = true;
			}
			$scope.changeLabelStyle = function(selectedGene){
				$scope.geneData[selectedGene].labelstylechanged = true;
			}
			$scope.changeDefaultStyle = function(){
				for (var i = 0; i < $scope.geneData.length; i++){
					if ($scope.geneData[i].labelstylechanged === false){
						$scope.geneData[i].labelstyle = $scope.graphSettings.fontStyle;
					}
				}
			}
			$scope.clickMultiLane = function(){
				if ($scope.graphSettings.multilane == true){
					$scope.graphSettings.shiftgenes = false;
					$scope.graphSettings.keepgaps = false;
				}
			}
			$scope.clickShiftgenes = function(){
				if ($scope.graphSettings.shiftgenes == false){
					$scope.graphSettings.keepgaps = false;
				}
			}
			$scope.changeAllLabels = function(status) {
				for (var i = 0; i < $scope.geneData.length; i++){
					$scope.geneData[i].labelhidden = status;
				}
			}
			$scope.colorAllLabels = function(color) {
				for (var i = 0; i < $scope.geneData.length; i++){
					$scope.geneData[i].labelcolor = color;
				}
			}
			$scope.$watch('graphSettings.labelPosition', function(newVal) {
				if (newVal === 'above' || newVal === 'below') {
					for (var i = 0; i < $scope.geneData.length; i++){
						if ($scope.geneData[i].labelcolorchanged === false && $scope.geneData[i].labelposchanged === false) {
							$scope.geneData[i].labelcolor = "#000000";
						}
					}
				}
				else if (newVal === 'middle') {
					for (var i = 0; i < $scope.geneData.length; i++){
						if ($scope.geneData[i].labelcolorchanged === false && $scope.geneData[i].labelposchanged === false) {
							$scope.geneData[i].labelcolor = colorService.getTextColor($scope.geneData[i].color);
						}
					}
				}
			});
		}])
		
		.controller("FileCtrl", ['$scope', 'geneService', 'colorService', function($scope, geneService, colorService){
			$scope.parseFile = function($fileContent){
				$scope.content = $fileContent;
				var lines = $scope.content.match(/[^\r\n]+/g);
				// Create a vertical genome offset

				var header = lines[0];
				var headercols = header.split('\t');
				var headerpos = {genome:null, start:null, stop:null, size:null, strand:null, name:null, color:null};
				for(var i = 0; i < headercols.length; i++){
					//console.log(i);
					var currHeaderCol = headercols[i].toLowerCase().replace(/ /g, '');
					//console.log(currHeaderCol);
					if (currHeaderCol === 'genome'){
						console.log(i);
						headerpos.genome = i;
					}
					else if (currHeaderCol === 'start'){
						headerpos.start = i;
					}
					else if (currHeaderCol === 'stop'){
						headerpos.stop = i;
					}
					else if (currHeaderCol === 'size' || currHeaderCol === 'size(nt)'){
						headerpos.size = i;
					}
					else if (currHeaderCol === 'strand'){
						headerpos.strand = i;
					}
					else if (currHeaderCol === 'name' || currHeaderCol === "genename"){
						headerpos.name = i;
					}
					else if (currHeaderCol === 'color' || currHeaderCol === 'genecolor'){
						headerpos.color = i;
					}
				}
				$scope.data = [];
				var offset = {};
				var vertOff = {};
				var maxVertOff = 0; // A counter to keep track of how many offets we'd made
				
				for (var i = 1; i < lines.length; i++){
					var gene = {genome:null, genomestyles:null, start:null, stop:null, size:null, strand:null, name:null, color:null, labelcolor:null, labelstyle: 'normal', labelhidden:false,  labelcolorchanged:false, labelstylechanged:false, labelpos:{x:null, y:null}, labelposchanged:false};
					var columns = lines[i].split('\t');
					
					var genome = columns[headerpos['genome']].split(" ");
					var genomestyles = [];
					gene['genome'] = genome;
					for (var j = 0; j < genome.length; j++){
						genomestyles.push("italic");
					}
					console.log(gene['genome']);
					for (var key in gene) {
						if(!offset.hasOwnProperty(genome)) {
						 //console.log("--" + genome + " - " + maxVertOff);
						 vertOff[genome] = maxVertOff;
						 maxVertOff+=2;
						 offset[genome] = Math.min(parseInt(columns[headerpos['start']]), parseInt(columns[headerpos['stop']]));
						}
						if ((key === 'name' || key === 'strand' || key === 'color') && headerpos[key] !== null){
							gene[key] = columns[headerpos[key]];
						}
						else if((key === 'start' || key === 'stop') && headerpos[key] !== null){
							gene[key] = parseInt(columns[headerpos[key]]) - offset[genome];
						}
						else if (key === 'size' && headerpos[key] !== null){
							gene[key] = parseInt(columns[headerpos[key]]);
						}
						else if((key === 'start' || key === 'stop') && headerpos[key] === null){
							alert("Important info missing!");
						}
						else if(key === 'strand' && headerpos[key] === null){
							if (gene['start'] <= gene['stop'])
								gene[key] = '+';
							else gene[key] = '-';
						}
						else if(key === 'size' && headerpos[key] === null){
							gene[key] = Math.abs(parseInt(columns[headerpos['stop']]) - parseInt(columns[headerpos['start']]));
						}
						else if(key === 'name' && headerpos[key] === null){
							gene[key] = "Gene" + i;
						}
						else if(key === 'color' && headerpos[key] === null){
							gene[key] = colorService.getRandomColor();
						}
						else if(key === 'labelcolor'){
							gene[key] = colorService.getTextColor(gene['color']);
						}
						gene['currLane']=vertOff[genome];
					}
					gene["genomestyles"] = genomestyles;
					$scope.data.push(gene);
				}
				geneService.updateGene($scope.data);
				
			}
		}])
		
		.controller("menuCtrl", function($scope, $rootScope) {
				$scope.bottomVisible = false;
				$scope.keepMenu = false;

				$scope.close = function() {
					$scope.bottomVisible = false;
				};

				$scope.showMenu = function(e) {
					$scope.bottomVisible = true;
					e.stopPropagation();
				};
				$rootScope.$on("menuClicked", function(e) {
					$scope.keepMenu = true;
				});
				$scope.$on("geneClicked", function(e) {
					$scope.keepMenu = true;
					$scope.$apply($scope.showMenu(e));
				})
				$rootScope.$on("documentClicked", _close);
				$rootScope.$on("escapePressed", _close);

				function _close() {
					if (!$scope.keepMenu) {
						$scope.$apply(function() {
							$scope.close(); 
						});
					}
					else {
						$scope.keepMenu= false;
					}
				}
		});
}());