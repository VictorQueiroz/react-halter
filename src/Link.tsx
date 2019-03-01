import autobind from 'autobind-decorator';
import { Router } from 'halter';
import * as React from 'react';
import { AnchorHTMLAttributes, PureComponent } from 'react';
import { withContext } from 'react-context-utilities';
import RouterContext from './RouterContext';

class Link extends PureComponent<AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  params?: Map<string, string>;
  query?: Map<string, string>;
  disabled?: boolean;
  router: Router;
}> {
  public render() {
    const {
      disabled,
      router,
      to,
      params = new Map(),
      query = new Map(),
      ...anchorProps
    } = this.props;

    if(!disabled && to) {
      anchorProps.href = router.resolve(to, params, query).replace(/\?$/, '');
      anchorProps.onClick = this.onClick;
    }

    return (
      <a {...anchorProps}/>
    );
  }
  @autobind
  private onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    e.stopPropagation();
    const {to, params, query, router} = this.props;
    router.pushState(to, params, query);
  }
}

function mapContextToProps({ router }: { router: Router; }) {
    return {
        router
    };
}

export default withContext({ router: RouterContext }, mapContextToProps)(Link);
