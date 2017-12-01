'use strict';

(function ($) {

  $(function() {

    var datasource = {
        'id' : '1',
        'name': 'Aidan Halliwell',
        'title': 'Director',
        'className' : 'topLevel',
        'children': [
          { 'id' : '2', 'name': 'Martin', 'title': 'Designer', 'className' : 'middleLevel' },
          { 'id' : '3', 'name': 'Gareth', 'title': 'Designer', 'className' : 'middleLevel'},
           { 'id' : '4', 'name': 'Paul', 'title': 'Lead Developer', 'className' : 'middleLevel',
            'children': [
              { 'id' : '5', 'name': 'Gareth ', 'title': 'Jnr Developer', 'className' : 'bottomLevel' },
              { 'id' : '6', 'name': 'Louis', 'title': 'Jnr Developer', 'className' : 'bottomLevel'}
            ]
          }
        ]
    };

    var getId = function() {
      return (new Date().getTime()) * 10 + Math.floor(Math.random() * 1);
    };

    $('#chart-container').orgchart({  
      'data' : datasource,
      'nodeContent' : 'title',
      'toggleSiblingsResp': true,
      'pan': false,
      'zoom': false,
      'parentNodeSymbol': 'fa-th-large',
      'nodeID' : 'id',
      'createNode': function($node, data) {          
          
        var secondMenuIcon = $('<i>', {
        'class': 'fa fa-info-circle second-menu-icon',
        click: function() {
        $(this).siblings('.second-menu').toggle();
      }
    });
    var secondMenu = '<div class="second-menu"><a href="profile' + data.id + '.html"><img class="avatar" src="avatar/' + data.id + '.png"></a></div>';
    $node.append(secondMenuIcon).append(secondMenu);
      },
        
    'draggable': true,
      'dropCriteria': function($draggedNode, $dragZone, $dropZone) {
        if($draggedNode.find('.content').text().indexOf('manager') > -1 && $dropZone.find('.content').text().indexOf('engineer') > -1) {
          return false;
        }
        return true;
      }
    })
    .on('click', '.node', function() {
      var $this = $(this);
      $('#selected-node').val($this.find('.title').text()).data('node', $this);
    })
    .on('click', '.orgchart', function(event) {
      if (!$(event.target).closest('.node').length) {
        $('#selected-node').val('');
      }
    });

    $('input[name="chart-state"]').on('click', function() {
      $('.orgchart').toggleClass('view-state', this.value !== 'view');
      $('#edit-panel').toggleClass('view-state', this.value === 'view');
      if ($(this).val() === 'edit') {
        $('.orgchart').find('tr').removeClass('hidden')
          .find('td').removeClass('hidden')
          .find('.node').removeClass('slide-up slide-down slide-right slide-left');
      } else {
        $('#btn-reset').trigger('click');
      }
    });

    $('input[name="node-type"]').on('click', function() {
      var $this = $(this);
      if ($this.val() === 'parent') {
        $('#edit-panel').addClass('edit-parent-node');
        $('#new-nodelist').children(':gt(0)').remove();
      } else {
        $('#edit-panel').removeClass('edit-parent-node');
      }
    });

    $('#btn-add-input').on('click', function() {
      $('#new-nodelist').append('<li><input type="text" class="new-node">');
        $('#new-nodelist').append('<li><input type="text" class="new-node">');
    });

    $('#btn-remove-input').on('click', function() {
      var inputs = $('#new-nodelist').children('li');
      if (inputs.length > 1) {
        inputs.last().remove();
      }
    });

    $('#btn-add-nodes').on('click', function() {
      var $chartContainer = $('#chart-container');
      var nodeVals = [];
      $('#new-nodelist').find('.new-node').each(function(index, item) {
        var validVal = item.value.trim();
        if (validVal.length) {
          nodeVals.push(validVal);
        }
      });
      var $node = $('#selected-node').data('node');
      if (!nodeVals.length) {
        alert('Please input value for new node');
        return;
      }
      var nodeType = $('input[name="node-type"]:checked');
      if (!nodeType.length) {
        alert('Please select a node type');
        return;
      }
      if (nodeType.val() !== 'parent' && !$('.orgchart').length) {
        alert('Please create the root node firstly when you want to build up the orgchart from the scratch');
        return;
      }
      if (nodeType.val() !== 'parent' && !$node) {
        alert('Please select one node in orgchart');
        return;
      }
      if (nodeType.val() === 'parent') {
        if (!$chartContainer.children().length) {// if the original chart has been deleted
          $chartContainer.orgchart({
            'data' : { 'name': nodeVals[0] },
            'parentNodeSymbol': 'fa-th-large',
            'createNode': function($node, data) {
              $node[0].id = getId();
            }
          })
          .find('.orgchart').addClass('view-state');
        } else {
          $chartContainer.orgchart('addParent', $chartContainer.find('.node:first'), { 'name': nodeVals[0], 'Id': getId() });
        }
      } else if (nodeType.val() === 'siblings') {
        $chartContainer.orgchart('addSiblings', $node,
          { 'siblings': nodeVals.map(function(item) { return { 'name': item, 'relationship': '110', 'Id': getId() }; })
        });
      } else {
        var hasChild = $node.parent().attr('colspan') > 0 ? true : false;
        if (!hasChild) {
          var rel = nodeVals.length > 1 ? '110' : '100';
          $chartContainer.orgchart('addChildren', $node, {
              'children': nodeVals.map(function(item) {
                return { 'name': item, 'relationship': rel, 'Id': getId() };
              })
            }, $.extend({}, $chartContainer.find('.orgchart').data('options'), { depth: 0 }));
        } else {
          $chartContainer.orgchart('addSiblings', $node.closest('tr').siblings('.nodes').find('.node:first'),
            { 'siblings': nodeVals.map(function(item) { return { 'name': item, 'relationship': '110', 'Id': getId() }; })
          });
        }
      }
    });

    $('#btn-delete-nodes').on('click', function() {
      var $node = $('#selected-node').data('node');
      if (!$node) {
        alert('Please select one node in orgchart');
        return;
      } else if ($node[0] === $('.orgchart').find('.node:first')[0]) {
        if (!window.confirm('Are you sure you want to delete the whole chart?')) {
          return;
        }
      }
      $('#chart-container').orgchart('removeNodes', $node);
      $('#selected-node').val('').data('node', null);
    });

  });

})(jQuery);