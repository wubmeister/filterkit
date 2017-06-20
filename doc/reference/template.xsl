<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
    <html>
    <head>
        <meta charset="utf-8" />
        <title><xsl:value-of select="doc/name" /> Reference</title>

        <link rel="stylesheet" type="text/css" href="template.css" />
    </head>
    <body>
        <div class="container">

            <xsl:if test="doc/path">
                <ul class="breadcrumbs">
                    <xsl:for-each select="doc/path/item">
                        <li><a href="{@url}"><xsl:value-of select="." /></a></li>
                    </xsl:for-each>
                    <li><xsl:value-of select="doc/name" /></li>
                </ul>
            </xsl:if>

            <h2><xsl:value-of select="doc/name" /></h2>
            <div class="meta"><xsl:value-of select="doc/type" /></div>
            <div class="description"><xsl:value-of select="doc/description" /></div>

            <xsl:if test="doc/definition">
                <h3>Definition</h3>

                <code><xsl:value-of select="doc/definition" /></code>
            </xsl:if>

            <xsl:if test="doc/params">
                <h3>Params</h3>

                <xsl:for-each select="doc/params/item">
                    <div class="item">
                        <div class="title"><xsl:value-of select="@name" /></div>
                        <div class="description"><xsl:value-of select="." /></div>
                    </div>
                </xsl:for-each>
            </xsl:if>

            <xsl:if test="doc/code">
                <h3>Example code</h3>

                <code><xsl:value-of select="doc/code" disable-output-escaping="yes" /></code>
            </xsl:if>

            <xsl:if test="doc/namespaces">
                <h3>Namespaces</h3>

                <xsl:for-each select="doc/namespaces/item">
                    <div class="item">
                        <div class="title"><a href="{@url}"><xsl:value-of select="@name" /></a></div>
                        <div class="description"><xsl:value-of select="." /></div>
                    </div>
                </xsl:for-each>
            </xsl:if>

            <xsl:if test="doc/classes">
                <h3>Classes</h3>

                <xsl:for-each select="doc/classes/item">
                    <div class="item">
                        <div class="title"><a href="{@url}"><xsl:value-of select="@name" /></a></div>
                        <div class="description"><xsl:value-of select="." /></div>
                    </div>
                </xsl:for-each>
            </xsl:if>

            <xsl:if test="doc/methods">
                <h3>Methods</h3>

                <xsl:for-each select="doc/methods/item">
                    <div class="item">
                        <div class="title"><a href="{@url}"><xsl:value-of select="@name" /> <span class="paramlist"> (<xsl:value-of select="@params" />)</span><xsl:if test="@return and @return != 'void'"> <span class="returnvalue"> : <xsl:value-of select="@return" /></span></xsl:if></a></div>
                        <div class="description"><xsl:value-of select="." /></div>
                    </div>
                </xsl:for-each>
            </xsl:if>
        </div>
    </body>
    </html>
</xsl:template>

</xsl:stylesheet>
