import Utility from "../../javascript/src/javascripts/utility.js";
import { delegate, hideAll } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

class CommentVotesTooltipComponent {
  // Trigger on the comment score link; see CommentComponent.
  static TARGET_SELECTOR = "span.comment-score";
  static SHOW_DELAY = 125;
  static HIDE_DELAY = 125;
  static DURATION = 250;
  static instance = null;

  static initialize() {
    if ($(CommentVotesTooltipComponent.TARGET_SELECTOR).length === 0) {
      return;
    }

    CommentVotesTooltipComponent.instance = delegate("body", {
      allowHTML: true,
      appendTo: document.querySelector("#comment-votes-tooltips"),
      delay: [CommentVotesTooltipComponent.SHOW_DELAY, CommentVotesTooltipComponent.HIDE_DELAY],
      duration: CommentVotesTooltipComponent.DURATION,
      interactive: true,
      maxWidth: "none",
      target: CommentVotesTooltipComponent.TARGET_SELECTOR,
      theme: "common-tooltip",
      touch: false,

      onShow: CommentVotesTooltipComponent.onShow,
      onHide: CommentVotesTooltipComponent.onHide,
    });
  }

  static async onShow(instance) {
    let $target = $(instance.reference);
    let $tooltip = $(instance.popper);
    let commentId = $target.parents("[data-id]").data("id");

    hideAll({ exclude: instance });

    try {
      $tooltip.addClass("tooltip-loading");

      instance._request = $.get(`/comments/${commentId}/votes`, { variant: "tooltip" });
      let html = await instance._request;
      instance.setContent(html);

      $tooltip.removeClass("tooltip-loading");
    } catch (error) {
      if (error.status !== 0 && error.statusText !== "abort") {
        Utility.error(`Error displaying votes for comment #${commentId} (error: ${error.status} ${error.statusText})`);
      }
    }
  }

  static async onHide(instance) {
    if (instance._request?.state() === "pending") {
      instance._request.abort();
    }
  }
}

$(document).ready(CommentVotesTooltipComponent.initialize);

export default CommentVotesTooltipComponent;
